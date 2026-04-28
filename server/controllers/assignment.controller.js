const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const User = require('../models/User');
const notifService = require('../services/notification.service');
const gamifService = require('../services/gamification.service');

const tokenize = (text = '') => new Set(
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2)
);

const extractFileTokens = (files = []) => new Set(
  files.flatMap((file) => (
    `${file.originalName || ''} ${file.filename || ''}`
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length > 2)
  ))
);

const mergeTokenSets = (...sets) => {
  const merged = new Set();
  sets.forEach((set) => set.forEach((token) => merged.add(token)));
  return merged;
};

const jaccardSimilarity = (leftSet, rightSet) => {
  if (leftSet.size === 0 || rightSet.size === 0) return 0;
  const intersection = [...leftSet].filter((token) => rightSet.has(token)).length;
  const union = new Set([...leftSet, ...rightSet]).size;
  return union === 0 ? 0 : intersection / union;
};

const buildSubmissionSignature = ({ submissionText = '', files = [] }) => {
  return mergeTokenSets(tokenize(submissionText), extractFileTokens(files));
};

const calculatePlagiarismScore = async ({ assignmentId, studentId, submissionText, files, excludeSubmissionId = null }) => {
  const currentSignature = buildSubmissionSignature({ submissionText, files });
  if (currentSignature.size === 0) return 0;

  const otherSubmissions = await Submission.find({
    assignment: assignmentId,
    student: { $ne: studentId },
    ...(excludeSubmissionId ? { _id: { $ne: excludeSubmissionId } } : {})
  });

  let maxSimilarity = 0;
  otherSubmissions.forEach((submission) => {
    const signature = buildSubmissionSignature({
      submissionText: submission.submissionText,
      files: submission.files
    });
    maxSimilarity = Math.max(maxSimilarity, jaccardSimilarity(currentSignature, signature));
  });

  return Math.round(maxSimilarity * 100);
};

const buildAssignmentSummary = (assignment, submissions, studentId = null) => {
  const submittedCount = submissions.length;
  const gradedSubmissions = submissions.filter((submission) => typeof submission.grade === 'number');
  const lateCount = submissions.filter((submission) => submission.isLate).length;
  const averageScore = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((accumulator, submission) => accumulator + submission.grade, 0) / gradedSubmissions.length
    : 0;
  const averagePercentage = assignment.maxMarks > 0 ? Math.round((averageScore / assignment.maxMarks) * 100) : 0;
  const mySubmission = studentId
    ? submissions.find((submission) => submission.student?._id?.toString() === studentId.toString())
    : null;
  const deadline = new Date(assignment.deadline);
  const now = new Date();
  const submissionStatus = mySubmission
    ? mySubmission.status === 'graded'
      ? 'graded'
      : mySubmission.isLate
        ? 'late'
        : 'submitted'
    : now > deadline && !assignment.allowLateSubmission
      ? 'closed'
      : 'pending';

  return {
    submittedCount,
    gradedCount: gradedSubmissions.length,
    pendingCount: Math.max((assignment.course?.enrolledStudents?.length || 0) - submittedCount, 0),
    lateCount,
    averageScore: Math.round(averageScore * 10) / 10,
    averagePercentage,
    countdownMs: deadline.getTime() - now.getTime(),
    mySubmission,
    submissionStatus
  };
};

const normaliseRubric = (rubric = []) => {
  if (!Array.isArray(rubric)) return [];
  return rubric
    .map((entry) => ({
      criterion: entry.criterion || '',
      weight: Number(entry.weight) || 0
    }))
    .filter((entry) => entry.criterion);
};

const getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'faculty') filter.faculty = req.user._id;
    if (req.user.role === 'student') {
      filter.course = { $in: req.user.enrolledCourses };
      filter.isPublished = true;
    }
    if (req.query.courseId) filter.course = req.query.courseId;

    const assignments = await Assignment.find(filter)
      .populate('course', 'name code semester enrolledStudents')
      .populate('faculty', 'name')
      .sort({ deadline: 1 });

    const assignmentIds = assignments.map((assignment) => assignment._id);
    const submissions = assignmentIds.length > 0
      ? await Submission.find({ assignment: { $in: assignmentIds } })
        .populate('student', 'name rollNo email profilePhoto')
      : [];

    const submissionsByAssignment = submissions.reduce((map, submission) => {
      const key = submission.assignment.toString();
      if (!map[key]) map[key] = [];
      map[key].push(submission);
      return map;
    }, {});

    const enrichedAssignments = assignments.map((assignment) => {
      const summary = buildAssignmentSummary(
        assignment,
        submissionsByAssignment[assignment._id.toString()] || [],
        req.user.role === 'student' ? req.user._id : null
      );

      return {
        ...assignment.toObject(),
        ...summary
      };
    });

    res.json({ success: true, data: enrichedAssignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      courseId,
      deadline,
      maxMarks,
      allowLateSubmission,
      estimatedMinutes,
      submissionType,
      tags,
      rubric
    } = req.body;

    const course = await Course.findById(courseId).populate('enrolledStudents', '_id');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'faculty' && course.faculty?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only create assignments for your own courses' });
    }

    const attachments = req.files
      ? req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/assignments/${file.filename}`,
        mimetype: file.mimetype
      }))
      : [];

    const assignment = await Assignment.create({
      title,
      description,
      instructions,
      course: courseId,
      faculty: req.user._id,
      deadline,
      maxMarks,
      allowLateSubmission,
      attachments,
      estimatedMinutes,
      submissionType: submissionType || 'file',
      tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      rubric: normaliseRubric(typeof rubric === 'string' ? JSON.parse(rubric || '[]') : rubric)
    });

    await notifService.createBulkNotifications(
      course.enrolledStudents.map((student) => student._id),
      {
        sender: req.user._id,
        type: 'assignment',
        title: 'New Assignment',
        message: `${title} due ${new Date(deadline).toLocaleDateString()}`,
        link: '/student/assignments'
      }
    );

    const populated = await Assignment.findById(assignment._id)
      .populate('course', 'name code semester enrolledStudents')
      .populate('faculty', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, submissionText = '' } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const isLate = new Date() > assignment.deadline;
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ success: false, message: 'Deadline passed' });
    }

    const files = req.files
      ? req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/assignments/${file.filename}`,
        mimetype: file.mimetype
      }))
      : [];

    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    const plagiarismScore = await calculatePlagiarismScore({
      assignmentId,
      studentId: req.user._id,
      submissionText,
      files,
      excludeSubmissionId: existing?._id || null
    });

    let submission;

    if (existing) {
      existing.versionHistory.push({
        files: existing.files,
        submissionText: existing.submissionText,
        submittedAt: existing.submittedAt,
        isLate: existing.isLate
      });
      existing.files = files;
      existing.submissionText = submissionText;
      existing.submittedAt = new Date();
      existing.isLate = isLate;
      existing.status = 'submitted';
      existing.grade = null;
      existing.feedback = '';
      existing.plagiarismScore = plagiarismScore;
      submission = await existing.save();
      await gamifService.awardPoints(req.user._id, isLate ? 2 : 5, 'Assignment resubmitted');
    } else {
      submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        files,
        submissionText,
        isLate,
        plagiarismScore
      });
      await gamifService.awardPoints(req.user._id, isLate ? 5 : 15, 'Assignment submitted');
    }

    await notifService.createNotification({
      recipient: assignment.faculty,
      sender: req.user._id,
      type: 'assignment',
      title: existing ? 'Assignment Resubmitted' : 'New Submission',
      message: `${req.user.name} submitted ${assignment.title}`,
      link: '/faculty/assignments'
    });

    const populated = await Submission.findById(submission._id)
      .populate('student', 'name rollNo email')
      .populate('assignment', 'title maxMarks');

    res.status(existing ? 200 : 201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'faculty' }
      })
      .populate('student', 'name email');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (req.user.role === 'faculty' && submission.assignment.course.faculty?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only grade submissions for your own course' });
    }

    submission.grade = Number(grade);
    submission.feedback = feedback || '';
    submission.status = 'graded';
    await submission.save();

    const fullSubmission = await Submission.findById(submission._id)
      .populate('student', 'name email')
      .populate('assignment', 'title maxMarks');

    const percentage = Math.round((fullSubmission.grade / fullSubmission.assignment.maxMarks) * 100);
    if (percentage >= 90) await gamifService.awardPoints(fullSubmission.student._id, 20, 'Excellent grade');
    else if (percentage >= 75) await gamifService.awardPoints(fullSubmission.student._id, 10, 'Good grade');

    await notifService.createNotification({
      recipient: fullSubmission.student._id,
      sender: req.user._id,
      type: 'grade',
      title: 'Assignment Graded',
      message: `Your ${fullSubmission.assignment.title} was graded: ${fullSubmission.grade}/${fullSubmission.assignment.maxMarks}`,
      link: '/student/grade'
    });

    res.json({ success: true, data: fullSubmission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('course', 'faculty enrolledStudents');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (req.user.role === 'faculty' && assignment.course.faculty?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review submissions for your own course' });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name rollNo email profilePhoto')
      .sort({ submittedAt: -1 });

    const gradedSubmissions = submissions.filter((submission) => typeof submission.grade === 'number');
    const averageScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((accumulator, submission) => accumulator + submission.grade, 0) / gradedSubmissions.length
      : 0;

    res.json({
      success: true,
      data: {
        submissions,
        summary: {
          submittedCount: submissions.length,
          gradedCount: gradedSubmissions.length,
          lateCount: submissions.filter((submission) => submission.isLate).length,
          pendingCount: Math.max((assignment.course.enrolledStudents?.length || 0) - submissions.length, 0),
          averageScore: Math.round(averageScore * 10) / 10,
          averagePercentage: assignment.maxMarks > 0 ? Math.round((averageScore / assignment.maxMarks) * 100) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPerformance = async (req, res) => {
  try {
    const submissions = await Submission.find({
      student: req.user._id,
      grade: { $ne: null }
    })
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'name code semester credits' }
      })
      .sort({ createdAt: 1 });

    const gradedSubmissions = submissions.filter((submission) => submission.assignment?.course);
    const byCourseMap = {};

    gradedSubmissions.forEach((submission) => {
      const course = submission.assignment.course;
      const key = course._id.toString();
      if (!byCourseMap[key]) {
        byCourseMap[key] = {
          course,
          totalMarks: 0,
          obtainedMarks: 0,
          assignments: 0,
          latestGrade: null
        };
      }

      const entry = byCourseMap[key];
      entry.totalMarks += submission.assignment.maxMarks;
      entry.obtainedMarks += submission.grade;
      entry.assignments += 1;
      entry.latestGrade = submission.grade;
    });

    const byCourse = Object.values(byCourseMap).map((entry) => {
      const percentage = entry.totalMarks > 0 ? Math.round((entry.obtainedMarks / entry.totalMarks) * 100) : 0;
      const gpa = Math.round((percentage / 10) * 10) / 10;
      return {
        ...entry,
        percentage,
        gpa,
        isWeak: percentage < 60
      };
    }).sort((left, right) => left.percentage - right.percentage);

    const totalObtainedMarks = byCourse.reduce((accumulator, entry) => accumulator + entry.obtainedMarks, 0);
    const totalMarks = byCourse.reduce((accumulator, entry) => accumulator + entry.totalMarks, 0);
    const cgpa = byCourse.length > 0
      ? Math.round((byCourse.reduce((accumulator, entry) => accumulator + entry.gpa, 0) / byCourse.length) * 100) / 100
      : 0;
    const overallPercentage = totalMarks > 0 ? Math.round((totalObtainedMarks / totalMarks) * 100) : 0;

    const peerStudents = await User.find({
      role: 'student',
      department: req.user.department,
      semester: req.user.semester,
      isActive: true
    }).select('_id name rollNo');

    const peerIds = peerStudents.map((student) => student._id);
    const peerSubmissions = await Submission.find({
      student: { $in: peerIds },
      grade: { $ne: null }
    }).populate({
      path: 'assignment',
      populate: { path: 'course', select: 'name code' }
    });

    const peerMap = {};
    peerSubmissions.forEach((submission) => {
      if (!peerMap[submission.student.toString()]) {
        peerMap[submission.student.toString()] = { obtained: 0, total: 0 };
      }
      peerMap[submission.student.toString()].obtained += submission.grade;
      peerMap[submission.student.toString()].total += submission.assignment?.maxMarks || 0;
    });

    const ranking = peerStudents
      .map((student) => {
        const peer = peerMap[student._id.toString()] || { obtained: 0, total: 0 };
        const percentage = peer.total > 0 ? Math.round((peer.obtained / peer.total) * 100) : 0;
        return { student, percentage };
      })
      .sort((left, right) => right.percentage - left.percentage);

    const rankIndex = ranking.findIndex((entry) => entry.student._id.toString() === req.user._id.toString());
    const classAverage = ranking.length > 0
      ? Math.round(ranking.reduce((accumulator, entry) => accumulator + entry.percentage, 0) / ranking.length)
      : 0;

    const trend = gradedSubmissions.map((submission) => ({
      label: submission.assignment?.title || 'Assignment',
      course: submission.assignment?.course?.code || '',
      percentage: submission.assignment?.maxMarks > 0
        ? Math.round((submission.grade / submission.assignment.maxMarks) * 100)
        : 0
    }));

    res.json({
      success: true,
      data: {
        summary: {
          overallPercentage,
          cgpa,
          gpa: cgpa,
          gradedAssignments: gradedSubmissions.length,
          weakSubjects: byCourse.filter((entry) => entry.isWeak).length,
          classAverage,
          classRank: rankIndex >= 0 ? rankIndex + 1 : null,
          classStrength: ranking.length
        },
        byCourse,
        trend,
        weakSubjects: byCourse.filter((entry) => entry.isWeak),
        ranking: ranking.slice(0, 10).map((entry, index) => ({
          rank: index + 1,
          name: entry.student.name,
          rollNo: entry.student.rollNo,
          percentage: entry.percentage
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
  getMyPerformance
};

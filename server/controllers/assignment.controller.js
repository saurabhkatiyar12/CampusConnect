const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const notifService = require('../services/notification.service');
const gamifService = require('../services/gamification.service');

const getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'faculty') filter.faculty = req.user._id;
    if (req.user.role === 'student') {
      const courseIds = req.user.enrolledCourses;
      filter.course = { $in: courseIds };
      filter.isPublished = true;
    }
    if (req.query.courseId) filter.course = req.query.courseId;

    const assignments = await Assignment.find(filter)
      .populate('course', 'name code').populate('faculty', 'name').sort({ deadline: 1 });
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, deadline, maxMarks, allowLateSubmission } = req.body;
    const course = await Course.findById(courseId).populate('enrolledStudents', '_id');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const attachments = req.files ? req.files.map(f => ({ filename: f.filename, path: f.path, mimetype: f.mimetype })) : [];
    const assignment = await Assignment.create({
      title, description, course: courseId, faculty: req.user._id,
      deadline, maxMarks, allowLateSubmission, attachments
    });

    await notifService.createBulkNotifications(
      course.enrolledStudents.map(s => s._id),
      { sender: req.user._id, type: 'assignment', title: 'New Assignment', message: `${title} due ${new Date(deadline).toLocaleDateString()}`, link: '/assignments' }
    );
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already submitted' });

    const isLate = new Date() > assignment.deadline;
    if (isLate && !assignment.allowLateSubmission)
      return res.status(400).json({ success: false, message: 'Deadline passed' });

    const files = req.files ? req.files.map(f => ({ filename: f.filename, path: f.path, mimetype: f.mimetype })) : [];
    const submission = await Submission.create({
      assignment: assignmentId, student: req.user._id, files, isLate
    });

    await gamifService.awardPoints(req.user._id, isLate ? 5 : 15, 'Assignment submitted');
    await notifService.createNotification({
      recipient: assignment.faculty, sender: req.user._id, type: 'assignment',
      title: 'New Submission', message: `${req.user.name} submitted ${assignment.title}`, link: '/grading'
    });
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id, { grade, feedback, status: 'graded' }, { new: true }
    ).populate('student', 'name email').populate('assignment', 'title maxMarks');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const pct = Math.round(grade / submission.assignment.maxMarks * 100);
    if (pct >= 90) await gamifService.awardPoints(submission.student._id, 20, 'Excellent grade');
    else if (pct >= 75) await gamifService.awardPoints(submission.student._id, 10, 'Good grade');

    await notifService.createNotification({
      recipient: submission.student._id, type: 'grade',
      title: 'Assignment Graded', message: `Your ${submission.assignment.title} was graded: ${grade}/${submission.assignment.maxMarks}`, link: '/assignments'
    });
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const filter = { assignment: req.params.assignmentId };
    const submissions = await Submission.find(filter).populate('student', 'name rollNo email profilePhoto');
    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAssignments, createAssignment, submitAssignment, gradeSubmission, getSubmissions };

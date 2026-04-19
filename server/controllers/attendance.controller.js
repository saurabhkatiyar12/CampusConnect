const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Course = require('../models/Course');
const { generateQRToken, generateQRCodeImage, verifyQRToken } = require('../utils/qr');
const notifService = require('../services/notification.service');
const gamifService = require('../services/gamification.service');

const createSession = async (req, res) => {
  try {
    const { courseId, location, expiryMinutes = 10 } = req.body;
    const course = await Course.findById(courseId).populate('enrolledStudents', '_id');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const session = await AttendanceSession.create({
      course: courseId, faculty: req.user._id,
      qrToken: 'pending', expiresAt, location,
      totalStudents: course.enrolledStudents.length
    });

    const finalToken = generateQRToken(session._id, courseId, expiryMinutes);
    const { qrDataURL } = await generateQRCodeImage(finalToken);
    session.qrToken = finalToken;
    session.qrCode = qrDataURL;
    await session.save();

    await notifService.createBulkNotifications(
      course.enrolledStudents.map(s => s._id),
      { sender: req.user._id, type: 'attendance', title: 'Attendance Open', message: `Scan QR for ${course.name}`, link: '/scan' }
    );
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = verifyQRToken(token);
    const session = await AttendanceSession.findById(decoded.sessionId).populate('course', 'name enrolledStudents');
    if (!session || !session.isActive || new Date() > session.expiresAt)
      return res.status(400).json({ success: false, message: 'QR expired or session closed' });

    const enrolled = session.course.enrolledStudents.some(s => s.toString() === req.user._id.toString());
    if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    const marked = session.markedStudents.some(s => s.student.toString() === req.user._id.toString());
    if (marked) return res.status(400).json({ success: false, message: 'Already marked' });

    const lateThreshold = new Date(session.createdAt.getTime() + 5 * 60 * 1000);
    const status = new Date() > lateThreshold ? 'late' : 'present';
    session.markedStudents.push({ student: req.user._id, status });
    await session.save();

    await AttendanceRecord.create({ student: req.user._id, course: session.course._id, session: session._id, status });
    await gamifService.awardPoints(req.user._id, status === 'present' ? 10 : 5, 'Attendance');
    res.json({ success: true, message: `Attendance marked: ${status}`, status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSessionStatus = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('course', 'name code')
      .populate('markedStudents.student', 'name rollNo profilePhoto');
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const closeSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id).populate('course', 'enrolledStudents');
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    session.isActive = false;
    await session.save();

    const markedIds = session.markedStudents.map(s => s.student.toString());
    const absentStudents = session.course.enrolledStudents.filter(s => !markedIds.includes(s.toString()));
    if (absentStudents.length > 0) {
      await AttendanceRecord.insertMany(
        absentStudents.map(sid => ({ student: sid, course: session.course._id, session: session._id, status: 'absent' })),
        { ordered: false }
      );
    }
    res.json({ success: true, message: 'Session closed', absent: absentStudents.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ student: req.user._id })
      .populate('course', 'name code').populate('session', 'date location').sort({ createdAt: -1 });

    const courseMap = {};
    records.forEach(r => {
      const key = r.course._id.toString();
      if (!courseMap[key]) courseMap[key] = { course: r.course, total: 0, present: 0, absent: 0, late: 0 };
      courseMap[key].total++;
      courseMap[key][r.status]++;
    });

    const stats = Object.values(courseMap).map(c => ({
      ...c, percentage: c.total > 0 ? Math.round((c.present + c.late) / c.total * 100) : 0
    }));
    res.json({ success: true, data: { records, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseAttendance = async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({ course: req.params.courseId })
      .populate('markedStudents.student', 'name rollNo').sort({ createdAt: -1 });
    const records = await AttendanceRecord.find({ course: req.params.courseId })
      .populate('student', 'name rollNo email').sort({ createdAt: -1 });
    res.json({ success: true, data: { sessions, records } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSession, markAttendance, getSessionStatus, closeSession, getMyAttendance, getCourseAttendance };

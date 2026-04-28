const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Course = require('../models/Course');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const { generateQRToken, generateQRCodeImage, verifyQRToken } = require('../utils/qr');
const notifService = require('../services/notification.service');
const gamifService = require('../services/gamification.service');

const ATTENDANCE_THRESHOLD = Number(process.env.ATTENDANCE_THRESHOLD || 75);
const PRESENT_STATUSES = new Set(['present', 'late']);

const startOfWeek = (value) => {
  const date = new Date(value);
  const dayIndex = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - dayIndex);
  return date;
};

const endOfWeek = (value) => {
  const date = startOfWeek(value);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfMonth = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

const formatWeekLabel = (value) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric'
});

const formatMonthLabel = (value) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  year: 'numeric'
});

const getRecordDate = (record) => new Date(
  record?.session?.date || record?.markedAt || record?.createdAt || Date.now()
);

const buildTrend = (records, bucket = 'week', count = 8) => {
  const now = new Date();
  const buckets = [];

  for (let index = count - 1; index >= 0; index--) {
    let start;
    let end;
    let label;

    if (bucket === 'month') {
      const seed = new Date(now.getFullYear(), now.getMonth() - index, 1);
      start = startOfMonth(seed);
      end = endOfMonth(seed);
      label = formatMonthLabel(seed);
    } else {
      const seed = new Date(now);
      seed.setDate(seed.getDate() - (index * 7));
      start = startOfWeek(seed);
      end = endOfWeek(seed);
      label = formatWeekLabel(start);
    }

    const bucketRecords = records.filter((record) => {
      const recordDate = getRecordDate(record);
      return recordDate >= start && recordDate <= end;
    });

    const present = bucketRecords.filter((record) => record.status === 'present').length;
    const late = bucketRecords.filter((record) => record.status === 'late').length;
    const absent = bucketRecords.filter((record) => record.status === 'absent').length;
    const total = bucketRecords.length;

    buckets.push({
      label,
      present,
      late,
      absent,
      total,
      rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0
    });
  }

  return buckets;
};

const buildCourseStats = (records) => {
  const courseMap = {};

  records.forEach((record) => {
    if (!record.course) return;

    const key = record.course._id.toString();
    if (!courseMap[key]) {
      courseMap[key] = {
        course: record.course,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        lastStatus: null,
        lastMarkedAt: null
      };
    }

    const entry = courseMap[key];
    entry.total += 1;
    if (typeof entry[record.status] === 'number') entry[record.status] += 1;

    const markedAt = new Date(record.markedAt || record.createdAt || Date.now());
    if (!entry.lastMarkedAt || markedAt > entry.lastMarkedAt) {
      entry.lastMarkedAt = markedAt;
      entry.lastStatus = record.status;
    }
  });

  return Object.values(courseMap)
    .map((entry) => {
      const attendedCount = entry.present + entry.late;
      const percentage = entry.total > 0 ? Math.round((attendedCount / entry.total) * 100) : 0;
      return {
        ...entry,
        attendedCount,
        percentage,
        threshold: ATTENDANCE_THRESHOLD,
        isBelowThreshold: percentage < ATTENDANCE_THRESHOLD
      };
    })
    .sort((left, right) => left.percentage - right.percentage);
};

const buildAlerts = (stats) => {
  return stats
    .filter((entry) => entry.isBelowThreshold)
    .map((entry) => {
      const neededClasses = Math.max(
        0,
        Math.ceil(
          (((ATTENDANCE_THRESHOLD / 100) * entry.total) - entry.attendedCount) /
          (1 - (ATTENDANCE_THRESHOLD / 100))
        )
      );

      return {
        course: entry.course,
        percentage: entry.percentage,
        threshold: ATTENDANCE_THRESHOLD,
        neededClasses,
        message: `${entry.course.name} is at ${entry.percentage}%. Attend ${neededClasses} upcoming classes to recover above ${ATTENDANCE_THRESHOLD}%.`
      };
    });
};

const buildValidationStats = (records) => {
  const geoTagged = records.filter((record) => record.geoLocation?.status === 'captured').length;
  const deviceTagged = records.filter((record) => Boolean(record.device?.userAgent)).length;

  return {
    geoTagged,
    geoTaggedRate: records.length > 0 ? Math.round((geoTagged / records.length) * 100) : 0,
    deviceTagged,
    deviceTaggedRate: records.length > 0 ? Math.round((deviceTagged / records.length) * 100) : 0
  };
};

const buildInsights = ({ summary, alerts, validationStats }) => {
  const insights = [];

  if (summary.totalRecords === 0) {
    insights.push({
      tone: 'info',
      title: 'Attendance has not started yet',
      message: 'Once your classes begin recording attendance, weekly trends and subject insights will appear here.'
    });
    return insights;
  }

  if (alerts.length > 0) {
    insights.push({
      tone: 'warning',
      title: 'Attendance shortage detected',
      message: `You have ${alerts.length} subject${alerts.length > 1 ? 's' : ''} below the ${ATTENDANCE_THRESHOLD}% threshold.`
    });
  } else {
    insights.push({
      tone: 'success',
      title: 'Attendance is in a healthy range',
      message: `Your overall attendance is ${summary.overallPercentage}% and currently meets the institutional threshold.`
    });
  }

  if (validationStats.geoTaggedRate < 100) {
    insights.push({
      tone: 'info',
      title: 'Geo-validation can be improved',
      message: 'Allow location access while scanning to strengthen attendance validation records.'
    });
  }

  if (summary.lateCount > 0) {
    insights.push({
      tone: 'warning',
      title: 'Late arrivals are being tracked',
      message: `${summary.lateCount} attendance mark${summary.lateCount > 1 ? 's were' : ' was'} recorded late. Aim to scan within the first five minutes.`
    });
  }

  return insights;
};

const buildSummary = (records, stats, alerts, validationStats) => {
  const presentCount = records.filter((record) => record.status === 'present').length;
  const lateCount = records.filter((record) => record.status === 'late').length;
  const absentCount = records.filter((record) => record.status === 'absent').length;
  const attendedCount = presentCount + lateCount;

  return {
    totalRecords: records.length,
    presentCount,
    lateCount,
    absentCount,
    attendedCount,
    overallPercentage: records.length > 0 ? Math.round((attendedCount / records.length) * 100) : 0,
    trackedCourses: stats.length,
    lowAttendanceCourses: alerts.length,
    threshold: ATTENDANCE_THRESHOLD,
    geoTaggedRate: validationStats.geoTaggedRate,
    deviceTaggedRate: validationStats.deviceTaggedRate
  };
};

const buildReportRows = (records) => {
  return records.map((record) => ({
    Date: getRecordDate(record).toLocaleDateString(),
    Course: record.course?.name || 'Unknown Course',
    Code: record.course?.code || '-',
    Status: record.status,
    SessionLocation: record.session?.location || record.location || '-',
    GeoStatus: record.geoLocation?.status || 'unavailable',
    Device: record.device?.platform || 'Unknown',
    MarkedAt: new Date(record.markedAt || record.createdAt || Date.now()).toLocaleString()
  }));
};

const buildPdfBuffer = ({ studentName, summary, rows }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('CampusConnect Attendance Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#666').text(`Student: ${studentName}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fillColor('#000').fontSize(12).text(`Overall Attendance: ${summary.overallPercentage}%`);
    doc.text(`Present: ${summary.presentCount}`);
    doc.text(`Late: ${summary.lateCount}`);
    doc.text(`Absent: ${summary.absentCount}`);
    doc.text(`Threshold Alerts: ${summary.lowAttendanceCourses}`);
    doc.moveDown();

    doc.fontSize(13).text('Attendance History');
    doc.moveDown(0.5);

    rows.slice(0, 40).forEach((row, index) => {
      doc
        .fontSize(10)
        .text(
          `${index + 1}. ${row.Date} | ${row.Code} | ${row.Status.toUpperCase()} | ${row.SessionLocation} | Geo: ${row.GeoStatus} | Device: ${row.Device}`,
          { lineGap: 2 }
        );
    });

    if (rows.length > 40) {
      doc.moveDown();
      doc.fontSize(10).fillColor('#666').text(`Showing 40 of ${rows.length} records in the PDF export.`);
    }

    doc.end();
  });
};

const normaliseGeoLocation = (geoLocation) => {
  if (!geoLocation || typeof geoLocation !== 'object') {
    return { status: 'unavailable' };
  }

  const latitude = Number(geoLocation.latitude);
  const longitude = Number(geoLocation.longitude);
  const accuracy = Number(geoLocation.accuracy);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  return {
    latitude: hasCoordinates ? latitude : null,
    longitude: hasCoordinates ? longitude : null,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
    status: hasCoordinates
      ? 'captured'
      : ['denied', 'unsupported', 'timeout', 'unavailable'].includes(geoLocation.status)
        ? geoLocation.status
        : 'unavailable',
    capturedAt: hasCoordinates ? new Date() : null
  };
};

const normaliseDevice = (deviceInfo, req) => {
  const payload = deviceInfo && typeof deviceInfo === 'object' ? deviceInfo : {};

  return {
    userAgent: payload.userAgent || req.get('user-agent') || '',
    platform: payload.platform || '',
    language: payload.language || ''
  };
};

const createSession = async (req, res) => {
  try {
    const { courseId, location, expiryMinutes = 10 } = req.body;
    const course = await Course.findById(courseId).populate('enrolledStudents', '_id');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'faculty' && course.faculty?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only start attendance for your own courses' });
    }

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const session = await AttendanceSession.create({
      course: courseId, faculty: req.user._id,
      qrToken: 'pending', expiresAt, location,
      totalStudents: course.enrolledStudents.length
    });

    const finalToken = generateQRToken(session._id, courseId, expiryMinutes);
    const { qrDataURL, url: scanUrl } = await generateQRCodeImage(finalToken);
    session.qrToken = finalToken;
    session.qrCode = qrDataURL;
    await session.save();

    await notifService.createBulkNotifications(
      course.enrolledStudents.map(s => s._id),
      { sender: req.user._id, type: 'attendance', title: 'Attendance Open', message: `Scan QR for ${course.name}`, link: '/scan' }
    );
    res.status(201).json({ success: true, data: { ...session.toObject(), scanUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    let { token } = req.body;
    const geoLocation = normaliseGeoLocation(req.body.geoLocation);
    const device = normaliseDevice(req.body.deviceInfo, req);
    const validation = {
      scanSource: ['camera', 'direct-link', 'manual'].includes(req.body.scanSource) ? req.body.scanSource : 'unknown',
      ipAddress: req.ip || ''
    };

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid attendance token' });
    }

    token = token.trim();
    if (token.includes('/scan?token=')) {
      try {
        const parsedUrl = new URL(token);
        const urlToken = parsedUrl.searchParams.get('token');
        if (urlToken) token = urlToken;
      } catch (parseError) {
        console.warn('Failed to parse token URL, using raw token value', parseError);
      }
    }

    const decoded = verifyQRToken(token);
    if (decoded.type !== 'attendance' || !decoded.sessionId || !decoded.courseId) {
      return res.status(400).json({ success: false, message: 'Invalid attendance token' });
    }

    const session = await AttendanceSession.findById(decoded.sessionId).populate('course', 'name enrolledStudents');
    if (!session || !session.course) {
      return res.status(404).json({ success: false, message: 'Attendance session not found' });
    }
    if (session.qrToken !== token || session.course._id.toString() !== decoded.courseId.toString()) {
      return res.status(400).json({ success: false, message: 'This QR code does not match the active attendance session' });
    }
    if (!session || !session.isActive || new Date() > session.expiresAt)
      return res.status(400).json({ success: false, message: 'QR expired or session closed' });

    const enrolled = session.course.enrolledStudents.some(s => s.toString() === req.user._id.toString());
    if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    const existingRecord = await AttendanceRecord.findOne({ student: req.user._id, session: session._id });
    if (existingRecord) {
      return res.status(400).json({ success: false, message: `Already marked as ${existingRecord.status}` });
    }

    const marked = session.markedStudents.some(s => s.student.toString() === req.user._id.toString());
    if (marked) return res.status(400).json({ success: false, message: 'Already marked' });

    const lateThreshold = new Date(session.createdAt.getTime() + 5 * 60 * 1000);
    const status = new Date() > lateThreshold ? 'late' : 'present';
    session.markedStudents.push({ student: req.user._id, status });
    await session.save();

    try {
      await AttendanceRecord.create({
        student: req.user._id,
        course: session.course._id,
        session: session._id,
        status,
        location: session.location,
        geoLocation,
        device,
        validation
      });
    } catch (recordError) {
      if (recordError?.code === 11000) {
        return res.status(400).json({ success: false, message: 'Attendance already marked' });
      }
      throw recordError;
    }
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
        absentStudents.map(sid => ({
          student: sid,
          course: session.course._id,
          session: session._id,
          status: 'absent',
          location: session.location
        })),
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
      .populate('course', 'name code')
      .populate('session', 'date location')
      .sort({ createdAt: -1 });

    const stats = buildCourseStats(records);
    const weeklyTrend = buildTrend(records, 'week', 8);
    const monthlyTrend = buildTrend(records, 'month', 6);
    const validationStats = buildValidationStats(records);
    const alerts = buildAlerts(stats);
    const summary = buildSummary(records, stats, alerts, validationStats);
    const insights = buildInsights({ summary, alerts, validationStats });

    res.json({
      success: true,
      data: {
        records,
        stats,
        summary,
        alerts,
        insights,
        weeklyTrend,
        monthlyTrend,
        validationStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseAttendance = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('enrolledStudents', 'name rollNo email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'faculty' && course.faculty?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review attendance for your own courses' });
    }

    const sessions = await AttendanceSession.find({ course: req.params.courseId })
      .populate('markedStudents.student', 'name rollNo').sort({ createdAt: -1 });
    const records = await AttendanceRecord.find({ course: req.params.courseId })
      .populate('student', 'name rollNo email').sort({ createdAt: -1 });

    const totalMarked = records.filter((record) => PRESENT_STATUSES.has(record.status)).length;
    const summary = {
      totalSessions: sessions.length,
      totalRecords: records.length,
      attendanceRate: records.length > 0 ? Math.round((totalMarked / records.length) * 100) : 0
    };

    const studentStatsMap = {};
    records.forEach((record) => {
      if (!record.student) return;

      const key = record.student._id.toString();
      if (!studentStatsMap[key]) {
        studentStatsMap[key] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }

      const entry = studentStatsMap[key];
      entry.total += 1;
      if (typeof entry[record.status] === 'number') entry[record.status] += 1;
    });

    const studentStats = Object.values(studentStatsMap).map((entry) => {
      const attendedCount = entry.present + entry.late;
      const percentage = entry.total > 0 ? Math.round((attendedCount / entry.total) * 100) : 0;
      return {
        ...entry,
        attendedCount,
        percentage,
        isBelowThreshold: percentage < ATTENDANCE_THRESHOLD
      };
    }).sort((left, right) => left.percentage - right.percentage);

    const enrolledWithoutRecords = course.enrolledStudents
      .filter((student) => !studentStatsMap[student._id.toString()])
      .map((student) => ({
        student,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendedCount: 0,
        percentage: 0,
        isBelowThreshold: true
      }));

    const defaulters = [...studentStats, ...enrolledWithoutRecords].filter((entry) => entry.isBelowThreshold);
    const weeklyTrend = buildTrend(records, 'week', 8);

    res.json({ success: true, data: { sessions, records, summary, studentStats, defaulters, weeklyTrend } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportMyAttendanceReport = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    if (!['csv', 'pdf'].includes(format)) {
      return res.status(400).json({ success: false, message: 'Supported formats are csv and pdf' });
    }

    const records = await AttendanceRecord.find({ student: req.user._id })
      .populate('course', 'name code')
      .populate('session', 'date location')
      .sort({ createdAt: -1 });

    const stats = buildCourseStats(records);
    const validationStats = buildValidationStats(records);
    const alerts = buildAlerts(stats);
    const summary = buildSummary(records, stats, alerts, validationStats);
    const rows = buildReportRows(records);
    const baseFileName = `attendance-report-${req.user.name.replace(/\s+/g, '-').toLowerCase()}`;

    if (format === 'csv') {
      const parser = new Parser({ fields: Object.keys(rows[0] || { Date: '', Course: '', Code: '', Status: '', SessionLocation: '', GeoStatus: '', Device: '', MarkedAt: '' }) });
      const csv = parser.parse(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${baseFileName}.csv"`);
      return res.send(csv);
    }

    const pdfBuffer = await buildPdfBuffer({
      studentName: req.user.name,
      summary,
      rows
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseFileName}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSession,
  markAttendance,
  getSessionStatus,
  closeSession,
  getMyAttendance,
  getCourseAttendance,
  exportMyAttendanceReport
};

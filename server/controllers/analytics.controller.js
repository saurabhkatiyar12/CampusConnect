const AttendanceRecord = require('../models/AttendanceRecord');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const User = require('../models/User');

const getAnalytics = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let attendanceFilter = {};
    if (courseId) attendanceFilter.course = courseId;
    if (req.user.role === 'faculty') {
      const myCourses = await Course.find({ faculty: req.user._id }).select('_id');
      attendanceFilter.course = { $in: myCourses.map(c => c._id) };
      if (courseId) attendanceFilter.course = courseId;
    }
    if (Object.keys(dateFilter).length) attendanceFilter.createdAt = dateFilter;

    const records = await AttendanceRecord.find(attendanceFilter)
      .populate('course', 'name code').populate('student', 'name rollNo');

    const totalPresent = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const totalAbsent = records.filter(r => r.status === 'absent').length;
    const attendanceRate = records.length > 0 ? Math.round(totalPresent / records.length * 100) : 0;

    // By course breakdown
    const byCoursemap = {};
    records.forEach(r => {
      const key = r.course ? r.course._id.toString() : 'unknown';
      if (!byCoursemap[key]) byCoursemap[key] = { course: r.course, present: 0, absent: 0, late: 0, total: 0 };
      byCoursemap[key].total++;
      byCoursemap[key][r.status]++;
    });
    const byCourse = Object.values(byCoursemap).map(c => ({
      ...c, rate: c.total > 0 ? Math.round((c.present + c.late) / c.total * 100) : 0
    }));

    // Students below 75%
    const lowAttendance = [];
    const studentCourseMap = {};
    records.forEach(r => {
      if (!r.student) return;
      const key = `${r.student._id}_${r.course?._id}`;
      if (!studentCourseMap[key]) studentCourseMap[key] = { student: r.student, course: r.course, present: 0, total: 0 };
      studentCourseMap[key].total++;
      if (r.status !== 'absent') studentCourseMap[key].present++;
    });
    Object.values(studentCourseMap).forEach(e => {
      const pct = e.total > 0 ? Math.round(e.present / e.total * 100) : 0;
      if (pct < 75) lowAttendance.push({ ...e, percentage: pct });
    });

    res.json({ success: true, data: { totalPresent, totalAbsent, attendanceRate, byCourse, lowAttendance, totalRecords: records.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };

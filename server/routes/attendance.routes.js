const router = require('express').Router();
const { createSession, markAttendance, getSessionStatus, closeSession, getMyAttendance, getCourseAttendance } = require('../controllers/attendance.controller');
const { protect, requireRole } = require('../middleware/auth');

router.post('/session', protect, requireRole('faculty', 'admin'), createSession);
router.post('/mark', protect, requireRole('student'), markAttendance);
router.get('/session/:id', protect, getSessionStatus);
router.post('/session/:id/close', protect, requireRole('faculty', 'admin'), closeSession);
router.get('/my', protect, requireRole('student'), getMyAttendance);
router.get('/course/:courseId', protect, requireRole('faculty', 'admin'), getCourseAttendance);

module.exports = router;

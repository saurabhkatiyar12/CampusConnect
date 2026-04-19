const router = require('express').Router();
const { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent } = require('../controllers/course.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, getCourses);
router.post('/', protect, requireRole('admin'), createCourse);
router.put('/:id', protect, requireRole('admin', 'faculty'), updateCourse);
router.delete('/:id', protect, requireRole('admin'), deleteCourse);
router.post('/:id/enroll', protect, requireRole('admin'), enrollStudent);
router.delete('/:id/enroll/:studentId', protect, requireRole('admin'), unenrollStudent);

module.exports = router;

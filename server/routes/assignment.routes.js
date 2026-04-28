const router = require('express').Router();
const { getAssignments, createAssignment, submitAssignment, gradeSubmission, getSubmissions, getMyPerformance } = require('../controllers/assignment.controller');
const { protect, requireRole } = require('../middleware/auth');
const { uploadAssignment } = require('../middleware/upload');

router.get('/', protect, getAssignments);
router.get('/performance/me', protect, requireRole('student'), getMyPerformance);
router.post('/', protect, requireRole('faculty', 'admin'), uploadAssignment.array('files', 5), createAssignment);
router.post('/submit', protect, requireRole('student'), uploadAssignment.array('files', 5), submitAssignment);
router.put('/grade/:id', protect, requireRole('faculty', 'admin'), gradeSubmission);
router.get('/:assignmentId/submissions', protect, requireRole('faculty', 'admin'), getSubmissions);

module.exports = router;

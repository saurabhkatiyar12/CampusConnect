const router = require('express').Router();
const { getTimetable, createSlot, updateSlot, deleteSlot } = require('../controllers/timetable.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, getTimetable);
router.post('/', protect, requireRole('admin'), createSlot);
router.put('/:id', protect, requireRole('admin'), updateSlot);
router.delete('/:id', protect, requireRole('admin'), deleteSlot);

module.exports = router;

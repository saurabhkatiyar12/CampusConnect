const router = require('express').Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcement.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, getAnnouncements);
router.post('/', protect, requireRole('admin', 'faculty'), createAnnouncement);
router.delete('/:id', protect, requireRole('admin', 'faculty'), deleteAnnouncement);

module.exports = router;

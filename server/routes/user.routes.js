const router = require('express').Router();
const { getAllUsers, getUserById, updateProfile, changePassword, updateUser, deleteUser, getLeaderboard, getStats } = require('../controllers/user.controller');
const { protect, requireRole } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/stats', protect, requireRole('admin'), getStats);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/', protect, requireRole('admin', 'faculty'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/:id', protect, requireRole('admin'), updateUser);
router.delete('/:id', protect, requireRole('admin'), deleteUser);

module.exports = router;

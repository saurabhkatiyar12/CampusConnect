const router = require('express').Router();
const { getAnalytics } = require('../controllers/analytics.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('admin', 'faculty'), getAnalytics);

module.exports = router;

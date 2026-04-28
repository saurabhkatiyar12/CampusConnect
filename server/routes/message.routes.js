const router = require('express').Router();
const { getConversations, getMessages, sendMessage, getClassroomMessages, sendClassroomMessage } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/classroom/:courseId', protect, getClassroomMessages);
router.post('/classroom/:courseId', protect, sendClassroomMessage);
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;

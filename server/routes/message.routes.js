const router = require('express').Router();
const { getConversations, getMessages, sendMessage } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;

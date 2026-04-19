const Message = require('../models/Message');

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.find({ conversationId: { $regex: userId } })
      .sort({ createdAt: -1 });

    const convMap = {};
    messages.forEach(m => {
      if (!convMap[m.conversationId]) convMap[m.conversationId] = m;
    });

    const conversations = await Promise.all(
      Object.values(convMap).map(async (m) => {
        const otherId = m.conversationId.split('_').find(id => id !== userId);
        const User = require('../models/User');
        const other = await User.findById(otherId).select('name email profilePhoto role');
        return { conversationId: m.conversationId, lastMessage: m, participant: other };
      })
    );
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId, isDeleted: false })
      .populate('sender', 'name profilePhoto').sort({ createdAt: 1 });
    await Message.updateMany({ conversationId, readBy: { $ne: req.user._id } }, { $addToSet: { readBy: req.user._id } });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const ids = [req.user._id.toString(), receiverId].sort();
    const conversationId = ids.join('_');
    const attachments = req.files ? req.files.map(f => ({ filename: f.filename, path: f.path, mimetype: f.mimetype })) : [];

    const message = await Message.create({
      sender: req.user._id, receiver: receiverId, conversationId, content, attachments, readBy: [req.user._id]
    });
    const populated = await Message.findById(message._id).populate('sender', 'name profilePhoto');

    const io = req.app.get('io');
    if (io) io.to(`user_${receiverId}`).emit('message', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage };

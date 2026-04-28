const Message = require('../models/Message');
const Course = require('../models/Course');

const ensureCourseAccess = async (courseId, user) => {
  const course = await Course.findById(courseId).populate('enrolledStudents', '_id');
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin') return course;
  if (user.role === 'faculty' && course.faculty?.toString() === user._id.toString()) return course;
  if (user.role === 'student' && course.enrolledStudents.some((student) => student._id.toString() === user._id.toString())) return course;

  const error = new Error('You are not allowed to access this classroom');
  error.statusCode = 403;
  throw error;
};

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

const getClassroomMessages = async (req, res) => {
  try {
    const course = await ensureCourseAccess(req.params.courseId, req.user);
    const conversationId = `classroom_${course._id}`;

    const messages = await Message.find({ conversationId, threadType: 'classroom', isDeleted: false })
      .populate('sender', 'name profilePhoto role')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const sendClassroomMessage = async (req, res) => {
  try {
    const course = await ensureCourseAccess(req.params.courseId, req.user);
    const conversationId = `classroom_${course._id}`;

    const message = await Message.create({
      sender: req.user._id,
      conversationId,
      course: course._id,
      threadType: 'classroom',
      content: req.body.content || '',
      readBy: [req.user._id]
    });

    const populated = await Message.findById(message._id).populate('sender', 'name profilePhoto role');
    const io = req.app.get('io');

    if (io) {
      const recipientIds = [
        ...course.enrolledStudents.map((student) => student._id.toString()),
        course.faculty?.toString()
      ].filter(Boolean);

      recipientIds.forEach((recipientId) => {
        io.to(`user_${recipientId}`).emit('classroomMessage', {
          courseId: course._id.toString(),
          message: populated
        });
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, getClassroomMessages, sendClassroomMessage };

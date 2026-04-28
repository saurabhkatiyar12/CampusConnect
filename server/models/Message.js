const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversationId: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  threadType: { type: String, enum: ['direct', 'classroom'], default: 'direct' },
  content: { type: String, default: '' },
  attachments: [{ filename: String, path: String, mimetype: String }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

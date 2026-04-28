const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  targetRoles: [{ type: String, enum: ['admin', 'faculty', 'student', 'all'] }],
  department: { type: String, default: 'all' },
  category: { type: String, enum: ['general', 'classroom', 'live-class', 'deadline', 'result'], default: 'general' },
  meetingLink: { type: String, default: '' },
  isPinned: { type: Boolean, default: false },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);

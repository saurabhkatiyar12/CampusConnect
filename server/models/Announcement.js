const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRoles: [{ type: String, enum: ['admin', 'faculty', 'student', 'all'] }],
  department: { type: String, default: 'all' },
  isPinned: { type: Boolean, default: false },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);

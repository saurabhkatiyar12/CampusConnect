const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  qrToken: { type: String, required: true },
  qrCode: { type: String },
  location: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  markedStudents: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['present', 'late'], default: 'present' }
  }],
  isActive: { type: Boolean, default: true },
  totalStudents: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);

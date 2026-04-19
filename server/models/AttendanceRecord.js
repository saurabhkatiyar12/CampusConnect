const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
  markedAt: { type: Date, default: Date.now },
  location: { type: String, default: '' }
}, { timestamps: true });

attendanceRecordSchema.index({ student: 1, course: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);

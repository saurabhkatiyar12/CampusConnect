const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
  markedAt: { type: Date, default: Date.now },
  location: { type: String, default: '' },
  geoLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    status: { type: String, enum: ['captured', 'denied', 'unsupported', 'timeout', 'unavailable'], default: 'unavailable' },
    capturedAt: { type: Date, default: null }
  },
  device: {
    userAgent: { type: String, default: '' },
    platform: { type: String, default: '' },
    language: { type: String, default: '' }
  },
  validation: {
    scanSource: { type: String, enum: ['camera', 'direct-link', 'manual', 'unknown'], default: 'unknown' },
    ipAddress: { type: String, default: '' }
  }
}, { timestamps: true });

attendanceRecordSchema.index({ student: 1, course: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);

const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, default: '' },
  semester: { type: Number, required: true },
  department: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);

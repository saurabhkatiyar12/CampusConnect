const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  instructions: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date, required: true },
  maxMarks: { type: Number, default: 100 },
  estimatedMinutes: { type: Number, default: 60 },
  submissionType: { type: String, enum: ['file', 'text', 'mixed'], default: 'file' },
  rubric: [{ criterion: String, weight: Number }],
  tags: [String],
  attachments: [{ filename: String, path: String, mimetype: String }],
  allowLateSubmission: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);

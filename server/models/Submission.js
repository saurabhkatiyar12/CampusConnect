const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{ filename: String, path: String, mimetype: String }],
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  grade: { type: Number, default: null },
  feedback: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' }
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);

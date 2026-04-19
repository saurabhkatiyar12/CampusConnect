const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{ filename: String, originalName: String, path: String, mimetype: String, size: Number }],
  subject: { type: String, default: '' },
  tags: [String],
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);

const StudyMaterial = require('../models/StudyMaterial');

const getMaterials = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.course = req.query.courseId;
    const materials = await StudyMaterial.find(filter)
      .populate('course', 'name code').populate('faculty', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadMaterial = async (req, res) => {
  try {
    const { title, description, courseId, subject, tags } = req.body;
    const files = req.files ? req.files.map(f => ({ filename: f.filename, originalName: f.originalname, path: f.path, mimetype: f.mimetype, size: f.size })) : [];
    const material = await StudyMaterial.create({
      title, description, course: courseId, faculty: req.user._id, files, subject, tags: tags ? tags.split(',') : []
    });
    const populated = await StudyMaterial.findById(material._id).populate('course', 'name').populate('faculty', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMaterials, uploadMaterial, deleteMaterial };

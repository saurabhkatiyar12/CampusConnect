const StudyMaterial = require('../models/StudyMaterial');
const Course = require('../models/Course');
const notifService = require('../services/notification.service');

const getMaterials = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.course = req.query.courseId;
    if (req.query.resourceType) filter.resourceType = req.query.resourceType;
    const materials = await StudyMaterial.find(filter)
      .populate('course', 'name code').populate('faculty', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadMaterial = async (req, res) => {
  try {
    const { title, description, courseId, subject, tags, resourceType, externalUrl, weekLabel } = req.body;
    const course = await Course.findById(courseId).populate('enrolledStudents', '_id');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'faculty' && course.faculty?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only upload material for your own courses' });
    }

    const files = req.files ? req.files.map(f => ({ filename: f.filename, originalName: f.originalname, path: `/uploads/materials/${f.filename}`, mimetype: f.mimetype, size: f.size })) : [];
    const material = await StudyMaterial.create({
      title,
      description,
      course: courseId,
      faculty: req.user._id,
      files,
      subject,
      tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      resourceType: resourceType || (externalUrl ? 'link' : 'document'),
      externalUrl: externalUrl || '',
      weekLabel: weekLabel || ''
    });
    const populated = await StudyMaterial.findById(material._id).populate('course', 'name').populate('faculty', 'name');

    await notifService.createBulkNotifications(
      course.enrolledStudents.map((student) => student._id),
      {
        sender: req.user._id,
        type: 'announcement',
        title: 'New Study Material',
        message: `${title} added to ${course.name}`,
        link: '/student/classroom'
      }
    );

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

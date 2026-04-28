const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const notifService = require('../services/notification.service');

const getAnnouncements = async (req, res) => {
  try {
    const filter = { $or: [{ targetRoles: 'all' }, { targetRoles: req.user.role }] };
    if (req.user.department) filter.$or.push({ department: req.user.department });
    if (req.query.courseId) filter.course = req.query.courseId;
    if (req.query.category) filter.category = req.query.category;
    const announcements = await Announcement.find(filter)
      .populate('postedBy', 'name role profilePhoto')
      .populate('course', 'name code')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const payload = { ...req.body, postedBy: req.user._id };

    if (payload.course) {
      const course = await Course.findById(payload.course).populate('enrolledStudents', '_id');
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      if (req.user.role === 'faculty' && course.faculty?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only post announcements for your own courses' });
      }
    }

    const ann = await Announcement.create(payload);
    const populated = await Announcement.findById(ann._id)
      .populate('postedBy', 'name role')
      .populate('course', 'name code');

    if (populated.course) {
      const course = await Course.findById(populated.course._id).populate('enrolledStudents', '_id');
      await notifService.createBulkNotifications(
        course.enrolledStudents.map((student) => student._id),
        {
          sender: req.user._id,
          type: 'announcement',
          title: populated.title,
          message: populated.body.slice(0, 120),
          link: '/student/classroom'
        }
      );
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };

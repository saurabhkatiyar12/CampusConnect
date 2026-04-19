const Announcement = require('../models/Announcement');

const getAnnouncements = async (req, res) => {
  try {
    const filter = { $or: [{ targetRoles: 'all' }, { targetRoles: req.user.role }] };
    if (req.user.department) filter.$or.push({ department: req.user.department });
    const announcements = await Announcement.find(filter)
      .populate('postedBy', 'name role profilePhoto').sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, postedBy: req.user._id });
    const populated = await Announcement.findById(ann._id).populate('postedBy', 'name role');
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

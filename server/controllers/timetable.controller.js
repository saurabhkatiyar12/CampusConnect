const Timetable = require('../models/Timetable');

const getTimetable = async (req, res) => {
  try {
    const { semester, department } = req.query;
    const filter = {};
    if (semester) filter.semester = semester;
    if (department) filter.department = department;
    if (req.user.role === 'student') { filter.semester = req.user.semester; filter.department = req.user.department; }
    const slots = await Timetable.find(filter).populate('course', 'name code').populate('faculty', 'name').sort({ day: 1, startTime: 1 });
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSlot = async (req, res) => {
  try {
    const slot = await Timetable.create(req.body);
    const populated = await Timetable.findById(slot._id).populate('course', 'name code').populate('faculty', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('course', 'name code');
    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTimetable, createSlot, updateSlot, deleteSlot };

const PDFDocument = require('pdfkit');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeToMinutes = (value = '00:00') => {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
};

const intervalsOverlap = (leftStart, leftEnd, rightStart, rightEnd) => (
  timeToMinutes(leftStart) < timeToMinutes(rightEnd) &&
  timeToMinutes(rightStart) < timeToMinutes(leftEnd)
);

const currentDayName = () => DAYS[new Date().getDay() - 1] || 'Monday';

const enrichTimetable = (slots) => {
  const conflicts = [];

  slots.forEach((slot, index) => {
    for (let pointer = index + 1; pointer < slots.length; pointer += 1) {
      const other = slots[pointer];
      if (slot.day !== other.day) continue;

      const overlaps = intervalsOverlap(slot.startTime, slot.endTime, other.startTime, other.endTime);
      const sameFaculty = slot.faculty?._id?.toString() && slot.faculty?._id?.toString() === other.faculty?._id?.toString();
      const sameRoom = slot.room && other.room && slot.room === other.room;

      if (overlaps && (sameFaculty || sameRoom)) {
        conflicts.push({
          reason: sameFaculty ? 'Faculty overlap' : 'Room overlap',
          first: slot,
          second: other
        });
      }
    }
  });

  const now = new Date();
  const today = currentDayName();
  const nowMinutes = (now.getHours() * 60) + now.getMinutes();

  const currentClass = slots.find((slot) => (
    slot.day === today &&
    timeToMinutes(slot.startTime) <= nowMinutes &&
    timeToMinutes(slot.endTime) >= nowMinutes
  )) || null;

  const upcomingClasses = slots
    .filter((slot) => (
      (slot.day === today && timeToMinutes(slot.startTime) > nowMinutes) ||
      DAYS.indexOf(slot.day) > DAYS.indexOf(today)
    ))
    .sort((left, right) => {
      const dayDifference = DAYS.indexOf(left.day) - DAYS.indexOf(right.day);
      return dayDifference !== 0 ? dayDifference : timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
    })
    .slice(0, 5);

  const byDay = DAYS.reduce((map, day) => {
    map[day] = slots
      .filter((slot) => slot.day === day)
      .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime));
    return map;
  }, {});

  return { currentClass, upcomingClasses, conflicts, byDay };
};

const buildTimetablePdf = (slots, title) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();

  DAYS.forEach((day) => {
    const daySlots = slots.filter((slot) => slot.day === day);
    if (daySlots.length === 0) return;

    doc.fontSize(14).text(day);
    doc.moveDown(0.3);
    daySlots.forEach((slot) => {
      doc
        .fontSize(10)
        .text(
          `${slot.startTime} - ${slot.endTime} | ${slot.course?.code || ''} ${slot.course?.name || ''} | ${slot.room || 'Room TBA'} | ${slot.faculty?.name || 'Faculty TBA'}`
        );
    });
    doc.moveDown();
  });

  doc.end();
});

const buildFilter = async (req) => {
  const { semester, department } = req.query;
  const filter = {};

  if (semester) filter.semester = semester;
  if (department) filter.department = department;

  if (req.user.role === 'student') {
    filter.semester = req.user.semester;
    filter.department = req.user.department;
  }

  if (req.user.role === 'faculty') {
    filter.faculty = req.user._id;
  }

  return filter;
};

const validateConflict = async (payload, excludeId = null) => {
  const query = {
    day: payload.day,
    semester: payload.semester,
    department: payload.department
  };

  if (excludeId) query._id = { $ne: excludeId };

  const sameDaySlots = await Timetable.find(query);
  const conflict = sameDaySlots.find((slot) => (
    intervalsOverlap(slot.startTime, slot.endTime, payload.startTime, payload.endTime) &&
    (
      (payload.room && slot.room === payload.room) ||
      (payload.faculty && slot.faculty?.toString() === payload.faculty.toString())
    )
  ));

  return conflict || null;
};

const getTimetable = async (req, res) => {
  try {
    const filter = await buildFilter(req);
    const slots = await Timetable.find(filter)
      .populate('course', 'name code')
      .populate('faculty', 'name')
      .sort({ day: 1, startTime: 1 });

    const insights = enrichTimetable(slots);
    res.json({ success: true, data: { slots, ...insights } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSlot = async (req, res) => {
  try {
    const conflict = await validateConflict(req.body);
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Timetable conflict detected with ${conflict.day} ${conflict.startTime}-${conflict.endTime}`
      });
    }

    const slot = await Timetable.create(req.body);
    const populated = await Timetable.findById(slot._id).populate('course', 'name code').populate('faculty', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    const payload = { ...req.body };
    const conflict = await validateConflict(payload, req.params.id);
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Timetable conflict detected with ${conflict.day} ${conflict.startTime}-${conflict.endTime}`
      });
    }

    const slot = await Timetable.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate('course', 'name code')
      .populate('faculty', 'name');
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

const exportTimetable = async (req, res) => {
  try {
    const filter = await buildFilter(req);
    const slots = await Timetable.find(filter)
      .populate('course', 'name code')
      .populate('faculty', 'name')
      .sort({ day: 1, startTime: 1 });

    const title = req.user.role === 'faculty'
      ? `${req.user.name} Teaching Timetable`
      : `${req.user.department} Semester ${req.user.semester} Timetable`;
    const pdfBuffer = await buildTimetablePdf(slots, title);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="timetable.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTimetable, createSlot, updateSlot, deleteSlot, exportTimetable };

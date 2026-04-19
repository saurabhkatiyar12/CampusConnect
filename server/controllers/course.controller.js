const Course = require('../models/Course');
const User = require('../models/User');

// GET /api/courses
const getCourses = async (req, res) => {
  try {
    const { department, semester, faculty } = req.query;
    const filter = { isActive: true };
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (faculty) filter.faculty = faculty;
    if (req.user.role === 'faculty') filter.faculty = req.user._id;
    if (req.user.role === 'student') filter._id = { $in: req.user.enrolledCourses };

    const courses = await Course.find(filter)
      .populate('faculty', 'name email profilePhoto')
      .populate('enrolledStudents', 'name rollNo')
      .sort({ name: 1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/courses
const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    const populated = await Course.findById(course._id).populate('faculty', 'name email');
    res.status(201).json({ success: true, data: populated, message: 'Course created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/courses/:id
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('faculty', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course, message: 'Course updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/courses/:id/enroll
const enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      await course.save();
      await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: course._id } });
    }
    res.json({ success: true, message: 'Student enrolled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/courses/:id/enroll/:studentId
const unenrollStudent = async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { $pull: { enrolledStudents: req.params.studentId } });
    await User.findByIdAndUpdate(req.params.studentId, { $pull: { enrolledCourses: req.params.id } });
    res.json({ success: true, message: 'Student unenrolled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent };

const User = require('../models/User');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');

// GET /api/users - Admin only
const getAllUsers = async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNo: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('enrolledCourses', 'name code semester credits');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let taughtCourses = [];
    let schedule = [];

    if (user.role === 'faculty') {
      taughtCourses = await Course.find({ faculty: user._id, isActive: true })
        .populate('enrolledStudents', 'name rollNo')
        .sort({ semester: 1, name: 1 });
      schedule = await Timetable.find({ faculty: user._id })
        .populate('course', 'name code')
        .sort({ day: 1, startTime: 1 });
    }

    res.json({ success: true, data: { ...user.toJSON(), taughtCourses, schedule } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, department, phone, semester } = req.body;
    const updateData = { name, department, phone, semester };
    if (req.file) updateData.profilePhoto = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!await user.comparePassword(currentPassword)) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/:id - Admin update user
const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, isActive, semester, rollNo } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role, department, isActive, semester, rollNo }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: 'User updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/users/:id - Admin
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { department, limit = 20 } = req.query;
    const filter = { role: 'student', isActive: true };
    if (department) filter.department = department;

    const students = await User.find(filter)
      .select('name email profilePhoto department rollNo gamification')
      .sort({ 'gamification.points': -1 })
      .limit(+limit);

    const leaderboard = students.map((s, idx) => ({ rank: idx + 1, ...s.toJSON() }));
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/stats - Admin overview stats
const getStats = async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalAdmins] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true })
    ]);
    const totalCourses = await Course.countDocuments({ isActive: true });
    res.json({ success: true, data: { totalStudents, totalFaculty, totalAdmins, totalCourses, totalUsers: totalStudents + totalFaculty + totalAdmins } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFacultyDirectory = async (req, res) => {
  try {
    const courseFilter = req.user.role === 'student'
      ? { _id: { $in: req.user.enrolledCourses }, isActive: true }
      : { isActive: true };

    const courses = await Course.find(courseFilter)
      .populate('faculty', 'name email department phone profilePhoto')
      .sort({ semester: 1, name: 1 });

    const facultyMap = {};
    courses.forEach((course) => {
      if (!course.faculty) return;
      const key = course.faculty._id.toString();
      if (!facultyMap[key]) {
        facultyMap[key] = {
          ...course.faculty.toObject(),
          subjects: [],
          semesters: new Set()
        };
      }

      facultyMap[key].subjects.push({
        _id: course._id,
        name: course.name,
        code: course.code,
        semester: course.semester,
        studentCount: course.enrolledStudents?.length || 0
      });
      facultyMap[key].semesters.add(course.semester);
    });

    const facultyList = await Promise.all(Object.values(facultyMap).map(async (faculty) => {
      const schedule = await Timetable.find({ faculty: faculty._id })
        .populate('course', 'name code')
        .sort({ day: 1, startTime: 1 })
        .limit(8);

      return {
        ...faculty,
        semesters: [...faculty.semesters].sort((left, right) => left - right),
        schedule
      };
    }));

    res.json({ success: true, data: facultyList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, changePassword, updateUser, deleteUser, getLeaderboard, getStats, getFacultyDirectory };

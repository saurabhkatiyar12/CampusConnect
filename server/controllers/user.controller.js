const User = require('../models/User');
const Course = require('../models/Course');

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
    const user = await User.findById(req.params.id).populate('enrolledCourses', 'name code');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
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

module.exports = { getAllUsers, getUserById, updateProfile, changePassword, updateUser, deleteUser, getLeaderboard, getStats };

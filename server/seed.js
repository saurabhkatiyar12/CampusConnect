require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');
const Announcement = require('./models/Announcement');
const Timetable = require('./models/Timetable');

const seed = async () => {
  const adminPass = 'admin123';
  const facultyPass = 'faculty123';
  const studentPass = await bcrypt.hash('student123', 12);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Announcement.deleteMany({}), Timetable.deleteMany({})]);
  console.log('🗑️ Cleared existing data');

  // Create Admin
  const admin = await User.create({ name: 'Dr. Admin', email: 'admin@campusconnect.edu', password: adminPass, role: 'admin', department: 'Administration', phone: '9876543210' });

  // Create Faculty
  const faculty1 = await User.create({ name: 'Prof. Sharma', email: 'sharma@campusconnect.edu', password: facultyPass, role: 'faculty', department: 'MCA', phone: '9876543211' });
  const faculty2 = await User.create({ name: 'Prof. Gupta', email: 'gupta@campusconnect.edu', password: facultyPass, role: 'faculty', department: 'MCA', phone: '9876543212' });

  // Create Students
  const students = await User.insertMany([
    { name: 'Rahul Kumar', email: 'rahul@campusconnect.edu', password: studentPass, role: 'student', department: 'MCA', rollNo: 'MCA001', semester: 2, gamification: { points: 150 } },
    { name: 'Priya Patel', email: 'priya@campusconnect.edu', password: studentPass, role: 'student', department: 'MCA', rollNo: 'MCA002', semester: 2, gamification: { points: 210 } },
    { name: 'Amit Singh', email: 'amit@campusconnect.edu', password: studentPass, role: 'student', department: 'MCA', rollNo: 'MCA003', semester: 2, gamification: { points: 90 } },
    { name: 'Sneha Reddy', email: 'sneha@campusconnect.edu', password: studentPass, role: 'student', department: 'MCA', rollNo: 'MCA004', semester: 2, gamification: { points: 175 } },
    { name: 'Kiran Mehta', email: 'kiran@campusconnect.edu', password: studentPass, role: 'student', department: 'MCA', rollNo: 'MCA005', semester: 2, gamification: { points: 320 } },
  ]);

  const studentIds = students.map(s => s._id);

  // Create Courses
  const courses = await Course.insertMany([
    { name: 'Advanced Algorithms', code: 'MCA201', department: 'MCA', semester: 2, credits: 4, faculty: faculty1._id, enrolledStudents: studentIds },
    { name: 'Web Technologies', code: 'MCA202', department: 'MCA', semester: 2, credits: 3, faculty: faculty1._id, enrolledStudents: studentIds },
    { name: 'Database Management', code: 'MCA203', department: 'MCA', semester: 2, credits: 4, faculty: faculty2._id, enrolledStudents: studentIds },
    { name: 'Computer Networks', code: 'MCA204', department: 'MCA', semester: 2, credits: 3, faculty: faculty2._id, enrolledStudents: studentIds },
  ]);

  // Update students enrolledCourses
  await User.updateMany({ role: 'student' }, { enrolledCourses: courses.map(c => c._id) });

  // Timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timetableData = [];
  courses.forEach((course, ci) => {
    days.slice(0, 3).forEach((day, di) => {
      timetableData.push({
        course: course._id, faculty: course.faculty, day,
        startTime: `${9 + ci}:00`, endTime: `${10 + ci}:00`,
        room: `Room ${101 + ci}`, semester: 2, department: 'MCA'
      });
    });
  });
  await Timetable.insertMany(timetableData);

  // Announcements
  await Announcement.insertMany([
    { title: '🎓 Welcome to CampusConnect!', body: 'This is your smart campus management platform. Explore all features!', postedBy: admin._id, targetRoles: ['all'], isPinned: true },
    { title: '📅 Mid-Semester Exams Schedule', body: 'Mid-semester exams will be held from May 15–22. Timetable posted on the portal.', postedBy: admin._id, targetRoles: ['student', 'faculty'] },
    { title: '⚠️ Attendance Alert', body: 'Students with attendance below 75% will not be permitted for exams. Check your attendance now.', postedBy: faculty1._id, targetRoles: ['student'] },
  ]);

  console.log('✅ Seed data created successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('Admin    → admin@campusconnect.edu / admin123');
  console.log('Faculty  → sharma@campusconnect.edu / faculty123');
  console.log('Faculty  → gupta@campusconnect.edu / faculty123');
  console.log('Student  → rahul@campusconnect.edu / student123');
  console.log('Student  → priya@campusconnect.edu / student123');
  console.log('Student  → amit@campusconnect.edu / student123');
  console.log('Student  → sneha@campusconnect.edu / student123');
  console.log('Student  → kiran@campusconnect.edu / student123');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

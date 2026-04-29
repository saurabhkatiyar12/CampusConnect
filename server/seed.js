require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');
const Announcement = require('./models/Announcement');
const Timetable = require('./models/Timetable');
const AttendanceSession = require('./models/AttendanceSession');
const AttendanceRecord = require('./models/AttendanceRecord');

const seed = async () => {
  const adminPass = 'admin123';
  const facultyPass = 'faculty123';
  const studentPass = await bcrypt.hash('student123', 12);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Announcement.deleteMany({}),
    Timetable.deleteMany({}),
    AttendanceSession.deleteMany({}),
    AttendanceRecord.deleteMany({})
  ]);
  console.log('🗑️ Cleared existing data');

  // Create Admin
  const admin = await User.create({
    name: 'Dr. Admin',
    email: 'admin@campusconnect.edu',
    password: adminPass,
    role: 'admin',
    department: 'Administration',
    phone: '9876543210'
  });

  // Create Faculty (6 faculty members)
  const facultyData = [
    { name: 'Prof. Sharma', email: 'sharma@campusconnect.edu', dept: 'MCA', phone: '9876543211' },
    { name: 'Prof. Gupta', email: 'gupta@campusconnect.edu', dept: 'MCA', phone: '9876543212' },
    { name: 'Prof. Singh', email: 'singh@campusconnect.edu', dept: 'MCA', phone: '9876543213' },
    { name: 'Prof. Patel', email: 'patel@campusconnect.edu', dept: 'MCA', phone: '9876543214' },
    { name: 'Prof. Kumar', email: 'kumar@campusconnect.edu', dept: 'MCA', phone: '9876543215' },
    { name: 'Prof. Verma', email: 'verma@campusconnect.edu', dept: 'MCA', phone: '9876543216' }
  ];

  const faculty = await User.insertMany(
    facultyData.map(f => ({
      name: f.name,
      email: f.email,
      password: facultyPass,
      role: 'faculty',
      department: f.dept,
      phone: f.phone
    }))
  );

  // Create Students (25 students with varied attendance)
  const studentDataList = [
    { name: 'Rahul Kumar', email: 'rahul@campusconnect.edu', rollNo: 'MCA001', points: 320 },
    { name: 'Priya Patel', email: 'priya@campusconnect.edu', rollNo: 'MCA002', points: 410 },
    { name: 'Amit Singh', email: 'amit@campusconnect.edu', rollNo: 'MCA003', points: 150 },
    { name: 'Sneha Reddy', email: 'sneha@campusconnect.edu', rollNo: 'MCA004', points: 380 },
    { name: 'Kiran Mehta', email: 'kiran@campusconnect.edu', rollNo: 'MCA005', points: 420 },
    { name: 'Vikas Pandey', email: 'vikas@campusconnect.edu', rollNo: 'MCA006', points: 280 },
    { name: 'Neha Singh', email: 'neha@campusconnect.edu', rollNo: 'MCA007', points: 350 },
    { name: 'Arjun Kapoor', email: 'arjun@campusconnect.edu', rollNo: 'MCA008', points: 180 },
    { name: 'Sana Khan', email: 'sana@campusconnect.edu', rollNo: 'MCA009', points: 390 },
    { name: 'Rohan Chopra', email: 'rohan@campusconnect.edu', rollNo: 'MCA010', points: 290 },
    { name: 'Anjali Sharma', email: 'anjali.s@campusconnect.edu', rollNo: 'MCA011', points: 440 },
    { name: 'Manoj Desai', email: 'manoj@campusconnect.edu', rollNo: 'MCA012', points: 120 },
    { name: 'Divya Nair', email: 'divya@campusconnect.edu', rollNo: 'MCA013', points: 370 },
    { name: 'Harsh Verma', email: 'harsh@campusconnect.edu', rollNo: 'MCA014', points: 220 },
    { name: 'Priya Singh', email: 'priya.s@campusconnect.edu', rollNo: 'MCA015', points: 400 },
    { name: 'Abhishek Roy', email: 'abhishek@campusconnect.edu', rollNo: 'MCA016', points: 260 },
    { name: 'Sakshi Yadav', email: 'sakshi@campusconnect.edu', rollNo: 'MCA017', points: 360 },
    { name: 'Nitin Saxena', email: 'nitin@campusconnect.edu', rollNo: 'MCA018', points: 100 },
    { name: 'Shreya Malhotra', email: 'shreya@campusconnect.edu', rollNo: 'MCA019', points: 430 },
    { name: 'Deepak Tomar', email: 'deepak@campusconnect.edu', rollNo: 'MCA020', points: 250 },
    { name: 'Pooja Mishra', email: 'pooja@campusconnect.edu', rollNo: 'MCA021', points: 340 },
    { name: 'Rajesh Kumar', email: 'rajesh@campusconnect.edu', rollNo: 'MCA022', points: 200 },
    { name: 'Isha Patel', email: 'isha@campusconnect.edu', rollNo: 'MCA023', points: 380 },
    { name: 'Sanjay Nair', email: 'sanjay@campusconnect.edu', rollNo: 'MCA024', points: 140 },
    { name: 'Kavya Sinha', email: 'kavya@campusconnect.edu', rollNo: 'MCA025', points: 410 }
  ];

  const students = await User.insertMany(
    studentDataList.map(s => ({
      name: s.name,
      email: s.email,
      password: studentPass,
      role: 'student',
      department: 'MCA',
      rollNo: s.rollNo,
      semester: 2,
      gamification: { points: s.points }
    }))
  );

  const studentIds = students.map(s => s._id);

  // Create Courses (10 courses)
  const courseData = [
    { name: 'Advanced Algorithms', code: 'MCA201', credits: 4, facIdx: 0 },
    { name: 'Web Technologies', code: 'MCA202', credits: 3, facIdx: 0 },
    { name: 'Database Management', code: 'MCA203', credits: 4, facIdx: 1 },
    { name: 'Computer Networks', code: 'MCA204', credits: 3, facIdx: 1 },
    { name: 'Machine Learning', code: 'MCA205', credits: 4, facIdx: 2 },
    { name: 'Cloud Computing', code: 'MCA206', credits: 3, facIdx: 2 },
    { name: 'Cybersecurity', code: 'MCA207', credits: 4, facIdx: 3 },
    { name: 'AI & Deep Learning', code: 'MCA208', credits: 3, facIdx: 3 },
    { name: 'Software Engineering', code: 'MCA209', credits: 4, facIdx: 4 },
    { name: 'Big Data Analytics', code: 'MCA210', credits: 3, facIdx: 5 }
  ];

  const courses = await Course.insertMany(
    courseData.map(c => ({
      name: c.name,
      code: c.code,
      department: 'MCA',
      semester: 2,
      credits: c.credits,
      faculty: faculty[c.facIdx]._id,
      enrolledStudents: studentIds
    }))
  );

  // Update students enrolledCourses
  await User.updateMany({ role: 'student' }, { enrolledCourses: courses.map(c => c._id) });

  // Create Timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timetableData = [];
  courses.forEach((course, ci) => {
    days.slice(0, 4).forEach((day, di) => {
      timetableData.push({
        course: course._id,
        faculty: course.faculty,
        day,
        startTime: `${9 + (ci % 6)}:00`,
        endTime: `${10 + (ci % 6)}:00`,
        room: `Room ${101 + ci}`,
        semester: 2,
        department: 'MCA'
      });
    });
  });
  await Timetable.insertMany(timetableData);

  // Create Attendance Sessions and Records
  const attendanceSessionsData = [];
  const attendanceRecordsData = [];

  for (let courseIdx = 0; courseIdx < courses.length; courseIdx++) {
    const course = courses[courseIdx];
    // Create 20 sessions per course
    for (let sessionIdx = 0; sessionIdx < 20; sessionIdx++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - (20 - sessionIdx));

      const session = await AttendanceSession.create({
        course: course._id,
        faculty: course.faculty,
        date: sessionDate,
        qrToken: `token_${course._id}_${sessionIdx}`,
        qrCode: `qr_${course._id}_${sessionIdx}`,
        location: `Room ${101 + courseIdx}`,
        expiresAt: new Date(sessionDate.getTime() + 2 * 60 * 60 * 1000),
        totalStudents: studentIds.length,
        isActive: false
      });

      // Create attendance records for students (simulating varied attendance)
      for (let stdIdx = 0; stdIdx < studentIds.length; stdIdx++) {
        // Attendance patterns:
        // - First 8 students: 90-95% attendance
        // - Next 9 students: 70-80% attendance (at-risk)
        // - Last 8 students: 50-70% attendance (critical risk)
        let isPresent;
        if (stdIdx < 8) {
          isPresent = Math.random() < 0.92; // 92% present
        } else if (stdIdx < 17) {
          isPresent = Math.random() < 0.75; // 75% present
        } else {
          isPresent = Math.random() < 0.60; // 60% present
        }

        const statusOptions = isPresent ? ['present', 'present', 'present', 'late'] : ['absent', 'absent', 'absent', 'absent'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        attendanceRecordsData.push({
          student: studentIds[stdIdx],
          course: course._id,
          session: session._id,
          status: status,
          markedAt: sessionDate,
          location: `Room ${101 + courseIdx}`,
          device: {
            userAgent: 'Mozilla/5.0',
            platform: 'Mobile',
            language: 'en-IN'
          },
          validation: {
            scanSource: 'camera',
            ipAddress: `192.168.${courseIdx}.${stdIdx}`
          }
        });
      }
    }
  }

  await AttendanceRecord.insertMany(attendanceRecordsData);

  // Create Announcements
  await Announcement.insertMany([
    {
      title: '🎓 Welcome to CampusConnect!',
      body: 'This is your smart campus management platform. Explore all features and enhance your learning experience!',
      postedBy: admin._id,
      targetRoles: ['all'],
      isPinned: true
    },
    {
      title: '📅 Mid-Semester Exams Schedule',
      body: 'Mid-semester exams will be held from May 15–22. Detailed timetable has been posted on the portal. Please check your course schedule.',
      postedBy: faculty[0]._id,
      targetRoles: ['student', 'faculty']
    },
    {
      title: '⚠️ Attendance Alert',
      body: 'Students with attendance below 75% will not be permitted for exams. Check your attendance now and improve your presence.',
      postedBy: faculty[0]._id,
      targetRoles: ['student']
    },
    {
      title: '💻 Programming Contest Announcement',
      body: 'Inter-college programming contest on May 25th. Register your team by May 20th. Prizes worth ₹50,000!',
      postedBy: admin._id,
      targetRoles: ['student'],
      isPinned: true
    },
    {
      title: '📚 Study Materials Updated',
      body: 'New study materials for Advanced Algorithms and Machine Learning courses are now available on the classroom hub.',
      postedBy: faculty[1]._id,
      targetRoles: ['student']
    }
  ]);

  console.log('✅ Seed data created successfully!');
  console.log('\n📊 Data Summary:');
  console.log(`✓ 1 Admin created`);
  console.log(`✓ 6 Faculty members created`);
  console.log(`✓ 25 Students created`);
  console.log(`✓ 10 Courses created`);
  console.log(`✓ 200 Attendance sessions created`);
  console.log(`✓ 5000 Attendance records created`);
  console.log(`✓ 5 Announcements created`);

  console.log('\n📋 COMPLETE USER CREDENTIALS LIST:\n');
  console.log('=== ADMIN ===');
  console.log('Email: admin@campusconnect.edu | Password: admin123\n');

  console.log('=== FACULTY (6) ===');
  facultyData.forEach(f => {
    console.log(`Email: ${f.email} | Password: ${facultyPass}`);
  });

  console.log('\n=== STUDENTS (25) ===');
  studentDataList.forEach(s => {
    console.log(`Email: ${s.email} | Password: student123`);
  });

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

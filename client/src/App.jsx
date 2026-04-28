import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AttendanceManager from './pages/faculty/AttendanceManager';
import AssignmentManager from './pages/faculty/AssignmentManager';
import FacultyClassroomManager from './pages/faculty/FacultyClassroomManager';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentFeature from './pages/student/StudentFeature';
import TeacherProfile from './pages/student/TeacherProfile';
import QRScanner from './pages/student/QRScanner';
import AssignmentList from './pages/student/AssignmentList';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentClassroom from './pages/student/StudentClassroom';
import StudentGrades from './pages/student/StudentGrades';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentTeachers from './pages/student/StudentTeachers';
import StudentSubjectRouting from './pages/student/StudentSubjectRouting';
import StudentTimetable from './pages/student/StudentTimetable';
import ProfilePage from './pages/shared/ProfilePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <CourseManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyDashboard />
        </ProtectedRoute>
      } />
      <Route path="/faculty/attendance" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <AttendanceManager />
        </ProtectedRoute>
      } />
      <Route path="/faculty/assignments" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <AssignmentManager />
        </ProtectedRoute>
      } />
      <Route path="/faculty/classroom" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyClassroomManager />
        </ProtectedRoute>
      } />
      
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/classroom" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentClassroom />
        </ProtectedRoute>
      } />
      <Route path="/student/grade" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentGrades />
        </ProtectedRoute>
      } />
      <Route path="/student/subject" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentSubjects />
        </ProtectedRoute>
      } />
      <Route path="/student/teacher" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentTeachers />
        </ProtectedRoute>
      } />
      <Route path="/student/teacher/:teacherName" element={
        <ProtectedRoute allowedRoles={['student']}>
          <TeacherProfile />
        </ProtectedRoute>
      } />
      <Route path="/student/subject-routing" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentSubjectRouting />
        </ProtectedRoute>
      } />
      <Route path="/student/timetable" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentTimetable />
        </ProtectedRoute>
      } />
      <Route path="/student/payment" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Student Payment" description="Manage your payments and fee details." />
        </ProtectedRoute>
      } />
      <Route path="/student/attendance" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentAttendance />
        </ProtectedRoute>
      } />
      <Route path="/student/exam" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Exam" description="Check exam schedules and results." />
        </ProtectedRoute>
      } />
      <Route path="/student/friends" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Friends" description="Connect with friends and classmates." />
        </ProtectedRoute>
      } />
      <Route path="/student/event" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Event" description="View upcoming events and announcements." />
        </ProtectedRoute>
      } />
      <Route path="/scan" element={
        <ProtectedRoute allowedRoles={['student']}>
          <QRScanner />
        </ProtectedRoute>
      } />
      <Route path="/student/assignments" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AssignmentList />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

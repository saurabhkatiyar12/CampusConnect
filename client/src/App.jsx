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
import StudentDashboard from './pages/student/StudentDashboard';
import StudentFeature from './pages/student/StudentFeature';
import TeacherProfile from './pages/student/TeacherProfile';
import QRScanner from './pages/student/QRScanner';
import AssignmentList from './pages/student/AssignmentList';
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
      
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/classroom" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Classroom" description="Your classroom overview and course details." />
        </ProtectedRoute>
      } />
      <Route path="/student/grade" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Grade" description="View your grades and progress." />
        </ProtectedRoute>
      } />
      <Route path="/student/subject" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Subject" description="Browse subjects and subject details." />
        </ProtectedRoute>
      } />
      <Route path="/student/teacher" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Teacher" description="See your assigned teachers and contact information." />
        </ProtectedRoute>
      } />
      <Route path="/student/teacher/:teacherName" element={
        <ProtectedRoute allowedRoles={['student']}>
          <TeacherProfile />
        </ProtectedRoute>
      } />
      <Route path="/student/subject-routing" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Subject Routing" description="View your subject routing and semester plan." />
        </ProtectedRoute>
      } />
      <Route path="/student/timetable" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Timetable" description="Check your timetable and lecture schedule." />
        </ProtectedRoute>
      } />
      <Route path="/student/payment" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Student Payment" description="Manage your payments and fee details." />
        </ProtectedRoute>
      } />
      <Route path="/student/attendance" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentFeature title="Attendance" description="View attendance records and scan history." />
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

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import QRScanner from './pages/student/QRScanner';
import AssignmentList from './pages/student/AssignmentList';
import ProfilePage from './pages/shared/ProfilePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Users, Calendar, Clock, CheckCircle, Bell, ClipboardList, BookOpen, CalendarDays } from 'lucide-react';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout title="Faculty Dashboard">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="glass-panel stat-card">
            <div className="stat-icon primary"><Calendar size={32} /></div>
            <div className="stat-content">
              <h3>My Courses</h3>
              <div className="stat-value">{loading ? '...' : courses.length}</div>
            </div>
          </div>
          
          <div className="glass-panel stat-card">
            <div className="stat-icon success"><Users size={32} /></div>
            <div className="stat-content">
              <h3>Total Students Enrolled</h3>
              <div className="stat-value">
                {loading ? '...' : courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <button
              type="button"
              onClick={() => navigate('/faculty/attendance')}
              className="glass-panel"
              style={{ padding: '20px', textAlign: 'left', border: '1px solid var(--glass-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <CheckCircle size={20} className="text-success" />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Manage Attendance</h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Take attendance, review student presence, and finalize session status.</p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/faculty/assignments')}
              className="glass-panel"
              style={{ padding: '20px', textAlign: 'left', border: '1px solid var(--glass-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <ClipboardList size={20} className="text-primary" />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Assignments</h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Create new assignments, grade submissions, and share feedback with students.</p>
            </button>

            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <CalendarDays size={20} className="text-warning" />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Upcoming Classes</h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Review the next scheduled lectures and check your course timetable at a glance.</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Bell size={20} className="text-info" />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Announcements</h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Send updates to students, publish notices, and manage class communications.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Your Courses Overview</h2>
          {loading ? (
            <p>Loading your courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-muted">You are not assigned to any courses yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {courses.map(course => (
                <div key={course._id} style={{ 
                  padding: '20px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }} className="hover:transform hover:-translate-y-1">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                      {course.code}
                    </span>
                    <span className="text-sm text-muted">Sem {course.semester}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{course.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <Users size={16} />
                    <span>{course.enrolledStudents?.length || 0} Students</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;

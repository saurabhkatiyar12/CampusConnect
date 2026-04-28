import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Users, Calendar, CheckCircle, Bell, ClipboardList, CalendarDays, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({
    attendanceRate: 0,
    byCourse: [],
    lowAttendance: [],
    totalPresent: 0,
    totalAbsent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [courseRes, analyticsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/analytics')
        ]);
        if (courseRes.data.success) {
          setCourses(courseRes.data.data);
        }
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
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

          <div className="glass-panel stat-card">
            <div className="stat-icon info"><TrendingUp size={32} /></div>
            <div className="stat-content">
              <h3>Attendance Success Rate</h3>
              <div className="stat-value">{loading ? '...' : `${analytics.attendanceRate}%`}</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon warning"><AlertTriangle size={32} /></div>
            <div className="stat-content">
              <h3>At-Risk Students</h3>
              <div className="stat-value">{loading ? '...' : analytics.lowAttendance.length}</div>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '18px' }}>Course Attendance Monitoring</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
              Track attendance health across the courses you teach.
            </p>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart
                  data={analytics.byCourse.map((course) => ({
                    course: course.course?.code || course.course?.name || 'Course',
                    rate: course.rate
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="course" stroke="rgba(255,255,255,0.7)" />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.7)" />
                  <Tooltip />
                  <Bar dataKey="rate" name="Attendance %" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Defaulter Watchlist</h2>
            {loading ? (
              <p>Loading attendance watchlist...</p>
            ) : analytics.lowAttendance.length === 0 ? (
              <p className="text-muted">No low-attendance students detected in your courses.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {analytics.lowAttendance.slice(0, 5).map((entry) => (
                  <div
                    key={`${entry.student?._id}-${entry.course?._id}`}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderLeft: '4px solid var(--warning)'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{entry.student?.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {entry.course?.code} • {entry.percentage}% attendance
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;

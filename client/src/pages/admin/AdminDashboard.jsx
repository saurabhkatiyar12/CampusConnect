import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Users, BookOpen, UserCheck, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0
  });
  const [analytics, setAnalytics] = useState({
    attendanceRate: 0,
    totalPresent: 0,
    totalAbsent: 0,
    byCourse: [],
    lowAttendance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/analytics')
        ]);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="animate-fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          <div className="glass-panel stat-card">
            <div className="stat-icon primary"><Users size={32} /></div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <div className="stat-value">{loading ? '...' : stats.totalUsers}</div>
            </div>
          </div>
          
          <div className="glass-panel stat-card">
            <div className="stat-icon success"><UserCheck size={32} /></div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <div className="stat-value">{loading ? '...' : stats.totalStudents}</div>
            </div>
          </div>
          
          <div className="glass-panel stat-card">
            <div className="stat-icon warning"><Activity size={32} /></div>
            <div className="stat-content">
              <h3>Total Faculty</h3>
              <div className="stat-value">{loading ? '...' : stats.totalFaculty}</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon info"><BookOpen size={32} /></div>
            <div className="stat-content">
              <h3>Active Courses</h3>
              <div className="stat-value">{loading ? '...' : stats.totalCourses}</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon success"><TrendingUp size={32} /></div>
            <div className="stat-content">
              <h3>Attendance Rate</h3>
              <div className="stat-value">{loading ? '...' : `${analytics.attendanceRate}%`}</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon warning"><AlertTriangle size={32} /></div>
            <div className="stat-content">
              <h3>Low Attendance Cases</h3>
              <div className="stat-value">{loading ? '...' : analytics.lowAttendance.length}</div>
            </div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '8px' }}>Attendance Monitoring</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Review attendance health across the institution and spot academic risk early.
            </p>
            <div style={{ width: '100%', height: '320px' }}>
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
                  <Bar dataKey="rate" name="Attendance %" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '16px' }}>Immediate Attention</h2>
            {loading ? (
              <p>Loading risk signals...</p>
            ) : analytics.lowAttendance.length === 0 ? (
              <p className="text-muted">No low-attendance cases detected yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {analytics.lowAttendance.slice(0, 6).map((entry) => (
                  <div
                    key={`${entry.student?._id}-${entry.course?._id}`}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      borderLeft: '4px solid var(--danger)'
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

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { QrCode, BookOpen, Star, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: [],
    attendanceStats: [],
    gamification: { points: 0, badges: [] }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [courseRes, attRes, meRes] = await Promise.all([
          api.get('/courses'),
          api.get('/attendance/my'),
          api.get('/auth/me')
        ]);
        
        setDashboardData({
          enrolledCourses: courseRes.data.success ? courseRes.data.data : [],
          attendanceStats: attRes.data.success ? attRes.data.data.stats : [],
          gamification: meRes.data.success ? meRes.data.data.gamification : { points: 0, badges: [] }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const overallAttendance = dashboardData.attendanceStats.length > 0 
    ? Math.round(dashboardData.attendanceStats.reduce((acc, curr) => acc + curr.percentage, 0) / dashboardData.attendanceStats.length) 
    : 0;

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          
          <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/scan')}>
            <div className="stat-icon primary" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white' }}>
              <QrCode size={32} />
            </div>
            <div className="stat-content">
              <h3>Scan QR Code</h3>
              <div className="text-sm text-muted">Mark Attendance</div>
            </div>
          </div>
          
          <div className="glass-panel stat-card">
            <div className="stat-icon info"><TrendingUp size={32} /></div>
            <div className="stat-content">
              <h3>Overall Attendance</h3>
              <div className="stat-value" style={{ color: overallAttendance >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                {loading ? '...' : `${overallAttendance}%`}
              </div>
            </div>
          </div>
          
          <div className="glass-panel stat-card">
            <div className="stat-icon warning"><Star size={32} /></div>
            <div className="stat-content">
              <h3>My Points</h3>
              <div className="stat-value">{loading ? '...' : dashboardData.gamification.points}</div>
            </div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Courses & Attendance breakdown */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>My Courses</h2>
            {loading ? (
              <p>Loading...</p>
            ) : dashboardData.enrolledCourses.length === 0 ? (
              <p className="text-muted">Not enrolled in any courses.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dashboardData.enrolledCourses.map(course => {
                  const stat = dashboardData.attendanceStats.find(s => s.course._id === course._id);
                  const pct = stat ? stat.percentage : 0;
                  return (
                    <div key={course._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '16px' }}>{course.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{course.code} • Sem {course.semester}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: pct >= 75 ? 'var(--success)' : 'var(--danger)' }}>{pct}%</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attendance</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gamification / Badges Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} className="text-warning" />
              My Badges
            </h2>
            {loading ? (
              <p>Loading...</p>
            ) : dashboardData.gamification.badges?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p>Attend classes and submit assignments to earn badges!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {dashboardData.gamification.badges.map((badge, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', 
                    border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-full)' 
                  }}>
                    <span style={{ fontSize: '16px' }}>{badge.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--warning)' }}>{badge.name}</span>
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

export default StudentDashboard;

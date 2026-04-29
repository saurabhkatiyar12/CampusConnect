import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Users, Calendar, CheckCircle, Bell, ClipboardList, CalendarDays, AlertTriangle, TrendingUp, BookOpen, Award, Clock, Target, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import './FacultyDashboard.css';

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

  const totalEnrolledStudents = courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);
  const attendanceChartData = analytics.byCourse?.map(c => ({
    course: c.course?.code || 'Course',
    rate: c.rate || 0
  })) || [];

  const attendanceDistribution = [
    { name: 'Present', value: analytics.totalPresent || 0, color: '#22c55e' },
    { name: 'Absent', value: analytics.totalAbsent || 0, color: '#ef4444' }
  ];

  const riskCategories = [
    { name: 'Good (80-100%)', count: analytics.lowAttendance?.filter(l => l.percentage >= 80).length || 0, color: '#10b981' },
    { name: 'At Risk (60-80%)', count: analytics.lowAttendance?.filter(l => l.percentage >= 60 && l.percentage < 80).length || 0, color: '#f59e0b' },
    { name: 'Critical (<60%)', count: analytics.lowAttendance?.filter(l => l.percentage < 60).length || 0, color: '#ef4444' }
  ];

  return (
    <DashboardLayout title="Faculty Dashboard">
      <div className="faculty-dashboard animate-fade-in">
        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1 className="header-title">Welcome Back, Faculty! 👋</h1>
            <p className="header-subtitle">Here's your teaching and attendance overview</p>
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card glass-panel stat-primary">
            <div className="stat-icon-wrapper primary">
              <BookOpen size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">My Courses</p>
              <h3 className="stat-value">{loading ? '...' : courses.length}</h3>
              <span className="stat-trend">Active courses assigned</span>
            </div>
          </div>

          <div className="stat-card glass-panel stat-success">
            <div className="stat-icon-wrapper success">
              <Users size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Students</p>
              <h3 className="stat-value">{loading ? '...' : totalEnrolledStudents}</h3>
              <span className="stat-trend">Across all courses</span>
            </div>
          </div>

          <div className="stat-card glass-panel stat-info">
            <div className="stat-icon-wrapper info">
              <TrendingUp size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Attendance Rate</p>
              <h3 className="stat-value">{loading ? '...' : `${analytics.attendanceRate}%`}</h3>
              <span className="stat-trend">{analytics.attendanceRate >= 75 ? '✓ Excellent' : '⚠ Needs attention'}</span>
            </div>
          </div>

          <div className="stat-card glass-panel stat-warning">
            <div className="stat-icon-wrapper warning">
              <AlertTriangle size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">At-Risk Students</p>
              <h3 className="stat-value">{loading ? '...' : analytics.lowAttendance.length}</h3>
              <span className="stat-trend">Below 75% attendance</span>
            </div>
          </div>

          <div className="stat-card glass-panel stat-accent">
            <div className="stat-icon-wrapper accent">
              <Target size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Present Today</p>
              <h3 className="stat-value">{loading ? '...' : analytics.totalPresent}</h3>
              <span className="stat-trend">Out of {loading ? '...' : totalEnrolledStudents}</span>
            </div>
          </div>

          <div className="stat-card glass-panel stat-secondary">
            <div className="stat-icon-wrapper secondary">
              <Award size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Classes Held</p>
              <h3 className="stat-value">{loading ? '...' : courses.length * 4}</h3>
              <span className="stat-trend">This semester</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section glass-panel">
          <div className="section-header">
            <h2 className="section-title">⚡ Quick Actions</h2>
            <p className="section-subtitle">Manage your daily tasks efficiently</p>
          </div>
          <div className="actions-grid">
            <button
              type="button"
              onClick={() => navigate('/faculty/attendance')}
              className="action-btn action-btn-primary"
            >
              <CheckCircle size={22} />
              <div>
                <h4>Manage Attendance</h4>
                <p>Take attendance and track presence</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/faculty/assignments')}
              className="action-btn action-btn-secondary"
            >
              <ClipboardList size={22} />
              <div>
                <h4>Assignments</h4>
                <p>Create & grade student work</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/faculty/classroom')}
              className="action-btn action-btn-info"
            >
              <BookOpen size={22} />
              <div>
                <h4>Classroom Hub</h4>
                <p>Materials & announcements</p>
              </div>
            </button>

            <button
              type="button"
              className="action-btn action-btn-warning"
            >
              <Calendar size={22} />
              <div>
                <h4>Timetable</h4>
                <p>View class schedule</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main Analytics Row */}
        <div className="analytics-row">
          {/* Attendance Chart */}
          <div className="chart-panel glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">📊 Course-wise Attendance</h3>
              <p className="panel-subtitle">Attendance rate by course</p>
            </div>
            {loading ? (
              <p className="text-muted">Loading chart...</p>
            ) : attendanceChartData.length === 0 ? (
              <p className="text-muted">No attendance data available</p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="course" stroke="rgba(255,255,255,0.7)" />
                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                      formatter={(value) => `${value}%`}
                    />
                    <Bar dataKey="rate" name="Attendance %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Attendance Distribution Pie Chart */}
          <div className="chart-panel glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">📈 Overall Attendance</h3>
              <p className="panel-subtitle">Present vs Absent today</p>
            </div>
            {loading ? (
              <p className="text-muted">Loading chart...</p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Courses & Risk Analysis Row */}
        <div className="content-row">
          {/* Your Courses */}
          <div className="courses-section glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">📚 Your Courses</h3>
              <p className="panel-subtitle">{courses.length} courses assigned</p>
            </div>
            {loading ? (
              <p className="text-muted">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="text-muted">You are not assigned to any courses yet.</p>
            ) : (
              <div className="courses-list">
                {courses.slice(0, 6).map(course => (
                  <div key={course._id} className="course-card">
                    <div className="course-header">
                      <span className="course-code">{course.code}</span>
                      <span className="course-semester">Sem {course.semester}</span>
                    </div>
                    <h4 className="course-name">{course.name}</h4>
                    <div className="course-stats">
                      <span className="stat-badge">
                        <Users size={14} /> {course.enrolledStudents?.length || 0} students
                      </span>
                      <span className="stat-badge">
                        <Clock size={14} /> {course.credits} credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Defaulter Watchlist */}
          <div className="watchlist-section glass-panel">
            <div className="panel-header">
              <h3 className="panel-title">⚠️ Attendance Watchlist</h3>
              <p className="panel-subtitle">Students needing attention</p>
            </div>
            {loading ? (
              <p className="text-muted">Loading watchlist...</p>
            ) : analytics.lowAttendance.length === 0 ? (
              <div className="no-data">
                <p className="text-muted">✓ No low-attendance students. Great job!</p>
              </div>
            ) : (
              <div className="watchlist-items">
                {analytics.lowAttendance.slice(0, 8).map((entry, idx) => (
                  <div
                    key={`${entry.student?._id}-${entry.course?._id}-${idx}`}
                    className={`watchlist-item risk-${entry.percentage < 60 ? 'critical' : entry.percentage < 80 ? 'medium' : 'low'}`}
                  >
                    <div className="watchlist-info">
                      <div className="student-name">{entry.student?.name}</div>
                      <div className="course-info">{entry.course?.code} • Roll: {entry.student?.rollNo}</div>
                    </div>
                    <div className="attendance-badge">{entry.percentage}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Risk Categories Summary */}
        <div className="risk-summary glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">📍 Student Risk Analysis</h3>
            <p className="panel-subtitle">Categorized by attendance level</p>
          </div>
          <div className="risk-grid">
            {riskCategories.map((category, idx) => (
              <div key={idx} className="risk-card" style={{ borderLeftColor: category.color }}>
                <div className="risk-color" style={{ backgroundColor: category.color }}></div>
                <div className="risk-info">
                  <p className="risk-label">{category.name}</p>
                  <h4 className="risk-count">{category.count} students</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="announcements-section glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">📢 Recent Announcements</h3>
            <p className="panel-subtitle">Important updates and notices</p>
          </div>
          <div className="announcements-list">
            <div className="announcement-item">
              <div className="announcement-icon">📅</div>
              <div className="announcement-content">
                <h4>Mid-Semester Exams Schedule</h4>
                <p>Exams will be held from May 15–22. Check the portal for detailed schedule.</p>
              </div>
            </div>
            <div className="announcement-item">
              <div className="announcement-icon">⚠️</div>
              <div className="announcement-content">
                <h4>Attendance Requirement</h4>
                <p>Students below 75% attendance won't be allowed for exams.</p>
              </div>
            </div>
            <div className="announcement-item">
              <div className="announcement-icon">💻</div>
              <div className="announcement-content">
                <h4>Programming Contest</h4>
                <p>Inter-college competition on May 25th with prizes worth ₹50,000!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;

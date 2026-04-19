import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Users, BookOpen, UserCheck, Activity } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        if (res.data.success) {
          setStats(res.data.data);
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

        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>System Overview</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome to the CampusConnect administration interface. Navigate using the sidebar to manage users, courses, and view analytical reports.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

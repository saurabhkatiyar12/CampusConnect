import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Award, BarChart3, ShieldAlert, Trophy } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line
} from 'recharts';

const StudentGrades = () => {
  const [data, setData] = useState({
    summary: null,
    byCourse: [],
    trend: [],
    weakSubjects: [],
    ranking: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/assignments/performance/me');
        if (res.data.success) setData(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  return (
    <DashboardLayout title="Grade Analytics">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h1 style={{ marginBottom: '8px' }}>Performance Intelligence</h1>
          <p className="text-muted">Track subject-wise marks, GPA, class ranking, and weak-subject alerts.</p>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '24px' }}>Loading grade analytics...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon primary"><BarChart3 size={28} /></div>
                <div className="stat-content">
                  <h3>Overall Percentage</h3>
                  <div className="stat-value">{data.summary?.overallPercentage || 0}%</div>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon success"><Award size={28} /></div>
                <div className="stat-content">
                  <h3>CGPA</h3>
                  <div className="stat-value">{data.summary?.cgpa || 0}</div>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon warning"><ShieldAlert size={28} /></div>
                <div className="stat-content">
                  <h3>Weak Subjects</h3>
                  <div className="stat-value">{data.summary?.weakSubjects || 0}</div>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon info"><Trophy size={28} /></div>
                <div className="stat-content">
                  <h3>Class Rank</h3>
                  <div className="stat-value">
                    {data.summary?.classRank ? `${data.summary.classRank}/${data.summary.classStrength}` : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Subject-Wise Marks</h2>
                <div style={{ width: '100%', height: '320px' }}>
                  <ResponsiveContainer>
                    <BarChart data={data.byCourse.map((entry) => ({ subject: entry.course.code, percentage: entry.percentage }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="subject" stroke="rgba(255,255,255,0.7)" />
                      <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.7)" />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Performance Trend</h2>
                <div style={{ width: '100%', height: '320px' }}>
                  <ResponsiveContainer>
                    <LineChart data={data.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" stroke="rgba(255,255,255,0.7)" />
                      <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.7)" />
                      <Tooltip />
                      <Line type="monotone" dataKey="percentage" stroke="#22c55e" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Weak Subject Watchlist</h2>
                {data.weakSubjects.length === 0 ? (
                  <p className="text-muted">No weak subjects detected. Great work.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {data.weakSubjects.map((entry) => (
                      <div key={entry.course._id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.08)' }}>
                        <div style={{ fontWeight: 600 }}>{entry.course.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {entry.percentage}% • GPA {entry.gpa}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Top Class Ranking</h2>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {data.ranking.map((entry) => (
                    <div key={`${entry.rank}-${entry.rollNo}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                      <div>
                        <strong>#{entry.rank} {entry.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{entry.rollNo}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>{entry.percentage}%</div>
                    </div>
                  ))}
                </div>
                {data.summary?.classAverage !== undefined && (
                  <p style={{ marginTop: '14px', color: 'var(--text-secondary)' }}>
                    Class average: <strong>{data.summary.classAverage}%</strong>
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;

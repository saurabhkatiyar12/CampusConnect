import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState({
    summary: null,
    stats: [],
    records: [],
    alerts: [],
    insights: [],
    weeklyTrend: [],
    monthlyTrend: [],
    validationStats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/attendance/my');
        if (res.data?.success) {
          setAttendanceData(res.data.data);
        } else {
          setError('Unable to load attendance analytics.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load attendance analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const subjectChartData = useMemo(() => attendanceData.stats.map((stat) => ({
    course: stat.course?.code || stat.course?.name || 'Course',
    rate: stat.percentage,
    threshold: stat.threshold,
    present: stat.present,
    late: stat.late,
    absent: stat.absent
  })), [attendanceData.stats]);

  const monthlyChartData = useMemo(() => attendanceData.monthlyTrend.map((entry) => ({
    ...entry,
    attended: entry.present + entry.late
  })), [attendanceData.monthlyTrend]);

  const downloadReport = async (format) => {
    try {
      setExporting(format);
      const res = await api.get(`/attendance/my/export?format=${format}`, {
        responseType: 'blob'
      });

      const disposition = res.headers['content-disposition'] || '';
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || `attendance-report.${format}`;
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export attendance report.');
    } finally {
      setExporting('');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p>Loading attendance analytics...</p>;
    }

    if (error) {
      return (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <AlertTriangle size={42} style={{ margin: '0 auto 12px', color: 'var(--warning)' }} />
          <p style={{ marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      );
    }

    if (!attendanceData.summary || attendanceData.summary.totalRecords === 0) {
      return (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <QrCode size={48} style={{ margin: '0 auto 16px', color: 'var(--accent-primary)' }} />
          <h2 style={{ marginBottom: '8px' }}>No attendance records yet</h2>
          <p className="text-muted" style={{ marginBottom: '20px' }}>
            Start scanning QR sessions to unlock attendance analytics, alerts, and exports.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/scan')} style={{ margin: '0 auto' }}>
            <QrCode size={18} />
            <span>Scan QR Code</span>
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon info"><TrendingUp size={28} /></div>
            <div className="stat-content">
              <h3>Overall Attendance</h3>
              <div
                className="stat-value"
                style={{ color: attendanceData.summary.overallPercentage >= attendanceData.summary.threshold ? 'var(--success)' : 'var(--danger)' }}
              >
                {attendanceData.summary.overallPercentage}%
              </div>
            </div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon success"><CheckCircle2 size={28} /></div>
            <div className="stat-content">
              <h3>Classes Attended</h3>
              <div className="stat-value">{attendanceData.summary.attendedCount}</div>
              <div className="text-sm text-muted">
                Present {attendanceData.summary.presentCount} • Late {attendanceData.summary.lateCount}
              </div>
            </div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon warning"><AlertTriangle size={28} /></div>
            <div className="stat-content">
              <h3>Threshold Alerts</h3>
              <div className="stat-value">{attendanceData.summary.lowAttendanceCourses}</div>
              <div className="text-sm text-muted">Below {attendanceData.summary.threshold}%</div>
            </div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon primary"><ShieldCheck size={28} /></div>
            <div className="stat-content">
              <h3>Geo-Validated</h3>
              <div className="stat-value">{attendanceData.summary.geoTaggedRate}%</div>
              <div className="text-sm text-muted">Device capture {attendanceData.summary.deviceTaggedRate}%</div>
            </div>
          </div>
        </div>

        {attendanceData.alerts.length > 0 && (
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertTriangle size={20} color="var(--danger)" />
              <h2 style={{ margin: 0, fontSize: '18px' }}>Attendance Alerts</h2>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {attendanceData.alerts.map((alert) => (
                <div
                  key={alert.course?._id || alert.course?.code}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderLeft: '4px solid var(--danger)'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{alert.course?.name} ({alert.course?.code})</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '18px' }}>Subject-Wise Attendance</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
              Compare every subject against the minimum threshold.
            </p>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="course" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" name="Attendance %" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="threshold" name="Threshold %" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '18px' }}>Weekly Trend</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
              Review attendance consistency over the last eight weeks.
            </p>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer>
                <LineChart data={attendanceData.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" name="Attendance %" stroke="#60a5fa" strokeWidth={3} />
                  <Line type="monotone" dataKey="absent" name="Absences" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '18px' }}>Monthly Attendance Pattern</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
              Track attended vs absent sessions over the last six months.
            </p>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="attended" name="Attended" stackId="1" stroke="#22c55e" fill="rgba(34, 197, 94, 0.4)" />
                  <Area type="monotone" dataKey="absent" name="Absent" stackId="1" stroke="#ef4444" fill="rgba(239, 68, 68, 0.35)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Smart Insights</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {attendanceData.insights.map((insight, index) => (
                  <div
                    key={`${insight.title}-${index}`}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: insight.tone === 'warning'
                        ? 'rgba(245, 158, 11, 0.08)'
                        : insight.tone === 'success'
                          ? 'rgba(34, 197, 94, 0.08)'
                          : 'rgba(59, 130, 246, 0.08)'
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>{insight.title}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{insight.message}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => navigate('/scan')} style={{ justifyContent: 'center' }}>
                  <QrCode size={18} />
                  <span>Scan QR Now</span>
                </button>
                <button
                  className="btn"
                  onClick={() => downloadReport('csv')}
                  disabled={exporting === 'csv'}
                  style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.08)' }}
                >
                  <Download size={18} />
                  <span>{exporting === 'csv' ? 'Exporting CSV...' : 'Export CSV'}</span>
                </button>
                <button
                  className="btn"
                  onClick={() => downloadReport('pdf')}
                  disabled={exporting === 'pdf'}
                  style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.08)' }}
                >
                  <Download size={18} />
                  <span>{exporting === 'pdf' ? 'Exporting PDF...' : 'Export PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginBottom: '6px', fontSize: '18px' }}>Attendance History</h2>
              <p className="text-muted">Every attendance mark with validation details and session context.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' }}>
                Geo capture {attendanceData.validationStats?.geoTaggedRate || 0}%
              </div>
              <div className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>
                Device capture {attendanceData.validationStats?.deviceTaggedRate || 0}%
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {['Date', 'Course', 'Status', 'Session Location', 'Geo Validation', 'Device', 'Marked At'].map((heading) => (
                    <th key={heading} style={{ padding: '14px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendanceData.records.map((record) => (
                  <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 12px' }}>{new Date(record.session?.date || record.markedAt || record.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{record.course?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.course?.code}</div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        className="badge"
                        style={{
                          background: record.status === 'absent'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : record.status === 'late'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(34, 197, 94, 0.15)',
                          color: record.status === 'absent'
                            ? 'var(--danger)'
                            : record.status === 'late'
                              ? 'var(--warning)'
                              : 'var(--success)'
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>{record.session?.location || record.location || '-'}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={15} color={record.geoLocation?.status === 'captured' ? 'var(--success)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '13px' }}>
                          {record.geoLocation?.status === 'captured'
                            ? `${record.geoLocation.latitude?.toFixed?.(4)}, ${record.geoLocation.longitude?.toFixed?.(4)}`
                            : record.geoLocation?.status || 'unavailable'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Smartphone size={15} color="var(--info)" />
                        <span style={{ fontSize: '13px' }}>{record.device?.platform || 'Unknown device'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(record.markedAt || record.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Attendance Analytics">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h1 style={{ marginBottom: '8px' }}>Attendance Intelligence Center</h1>
              <p className="text-muted">
                Monitor subject-wise performance, threshold risk, scan validation, and export-ready attendance history.
              </p>
            </div>
            <button className="btn" onClick={() => navigate('/student')} style={{ background: 'rgba(255,255,255,0.08)' }}>
              Back to Dashboard
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;

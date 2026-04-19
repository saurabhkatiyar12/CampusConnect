import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { QrCode, Play, Square, Users, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const AttendanceManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [liveStudents, setLiveStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    api.get('/courses').then(res => {
      if (res.data.success) setCourses(res.data.data);
    });

    const backendURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    socketRef.current = io(backendURL, { withCredentials: true });
    socketRef.current.emit('join', user._id);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user._id]);

  useEffect(() => {
    if (activeSession && socketRef.current) {
      socketRef.current.emit('joinSession', activeSession._id);
      
      // We can also poll or set up specific socket events for live attendance updates
      const interval = setInterval(() => {
        api.get(`/attendance/session/${activeSession._id}`).then(res => {
          if (res.data.success) {
            setLiveStudents(res.data.data.markedStudents);
          }
        });
      }, 3000); // Polling every 3s for MVP
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const startSession = async () => {
    if (!selectedCourse) return alert("Please select a course first");
    setLoading(true);
    try {
      const res = await api.post('/attendance/session', {
        courseId: selectedCourse,
        expiryMinutes: 10,
        location: 'Classroom'
      });
      if (res.data.success) {
        setActiveSession(res.data.data);
        setLiveStudents([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;
    try {
      await api.post(`/attendance/session/${activeSession._id}/close`);
      setActiveSession(null);
      setLiveStudents([]);
      alert("Session closed successfully");
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close session');
    }
  };

  return (
    <DashboardLayout title="QR Attendance Manager">
      <div className="animate-fade-in" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Controls Panel */}
        <div className="glass-panel" style={{ flex: '1 1 350px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2>Attendance Controls</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Select Course</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!!activeSession}
              style={{
                padding: '12px',
                background: 'rgba(0,0,0,0.2)',
                border: `1px solid var(--glass-border)`,
                borderRadius: 'var(--radius-md)',
                color: 'white'
              }}
            >
              <option value="">-- Choose a course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
            </select>
          </div>

          {!activeSession ? (
            <button 
              onClick={startSession}
              disabled={loading || !selectedCourse}
              className="btn btn-primary"
              style={{ justifyContent: 'center', marginTop: '10px' }}
            >
              <Play size={18} />
              <span>Start Session & Generate QR</span>
            </button>
          ) : (
            <button 
              onClick={endSession}
              className="btn"
              style={{ justifyContent: 'center', marginTop: '10px', background: 'var(--danger)', color: 'white' }}
            >
              <Square size={18} />
              <span>End Session Automatically</span>
            </button>
          )}

          {activeSession && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', margin: '0 auto', boxShadow: 'var(--shadow-glow)' }}>
                <img src={activeSession.qrCode} alt="Attendance QR Code" style={{ width: '250px', height: '250px' }} />
              </div>
              <p style={{ marginTop: '16px', color: 'var(--warning)', fontWeight: '500' }}>
                Session expires at: {new Date(activeSession.expiresAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Live Tracking Panel */}
        <div className="glass-panel" style={{ flex: '2 1 500px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Live Scans</h2>
            <div className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Users size={14} />
              <span>{liveStudents.length} Marked</span>
            </div>
          </div>

          {!activeSession ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <QrCode size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Start a session to see live attendance tracking</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {liveStudents.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Waiting for students to scan...</p>
              ) : (
                liveStudents.map((scan, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${scan.status === 'present' ? 'var(--success)' : 'var(--warning)'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                        {scan.student.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{scan.student.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{scan.student.rollNo}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </span>
                      <CheckCircle size={18} color={scan.status === 'present' ? 'var(--success)' : 'var(--warning)'} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AttendanceManager;

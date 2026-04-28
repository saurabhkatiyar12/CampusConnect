import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import {
  Bell,
  BookOpen,
  ExternalLink,
  FileText,
  MessageSquare,
  PlayCircle,
  Send,
  Users
} from 'lucide-react';

const StudentClassroom = () => {
  const { socket } = useSocket() || {};
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [classroom, setClassroom] = useState({
    announcements: [],
    materials: [],
    assignments: [],
    discussion: []
  });

  const backendBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
    []
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          setCourses(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedCourseId((current) => current || res.data.data[0]._id);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchClassroom = async () => {
      const [announcementRes, materialRes, assignmentRes, discussionRes] = await Promise.all([
        api.get(`/announcements?courseId=${selectedCourseId}`),
        api.get(`/materials?courseId=${selectedCourseId}`),
        api.get(`/assignments?courseId=${selectedCourseId}`),
        api.get(`/messages/classroom/${selectedCourseId}`)
      ]);

      setClassroom({
        announcements: announcementRes.data.success ? announcementRes.data.data : [],
        materials: materialRes.data.success ? materialRes.data.data : [],
        assignments: assignmentRes.data.success ? assignmentRes.data.data : [],
        discussion: discussionRes.data.success ? discussionRes.data.data : []
      });
    };

    fetchClassroom().catch(console.error);
  }, [selectedCourseId]);

  useEffect(() => {
    if (!socket || !selectedCourseId) return;

    const handler = (payload) => {
      if (payload.courseId !== selectedCourseId) return;
      setClassroom((current) => ({
        ...current,
        discussion: [...current.discussion, payload.message]
      }));
    };

    socket.on('classroomMessage', handler);
    return () => socket.off('classroomMessage', handler);
  }, [socket, selectedCourseId]);

  const selectedCourse = courses.find((course) => course._id === selectedCourseId);
  const liveClassLink = classroom.announcements.find((announcement) => announcement.meetingLink)?.meetingLink
    || classroom.materials.find((material) => material.resourceType === 'live-class' && material.externalUrl)?.externalUrl
    || '';

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await api.post(`/messages/classroom/${selectedCourseId}`, { content: message.trim() });
      if (res.data.success) {
        setClassroom((current) => ({
          ...current,
          discussion: [...current.discussion, res.data.data]
        }));
        setMessage('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAssetUrl = (resourcePath = '') => (
    resourcePath.startsWith('http') ? resourcePath : `${backendBaseUrl}${resourcePath}`
  );

  return (
    <DashboardLayout title="Classroom Hub">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ marginBottom: '8px' }}>Interactive Classroom</h1>
              <p className="text-muted">Announcements, resources, live links, assignments, and class discussion in one place.</p>
            </div>
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              style={{
                padding: '12px 14px',
                minWidth: '260px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white'
              }}
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '24px' }}>Loading classroom...</div>
        ) : !selectedCourse ? (
          <div className="glass-panel" style={{ padding: '24px' }}>No enrolled courses found.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon primary"><BookOpen size={28} /></div>
                <div className="stat-content">
                  <h3>Active Resources</h3>
                  <div className="stat-value">{classroom.materials.length}</div>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon info"><Bell size={28} /></div>
                <div className="stat-content">
                  <h3>Announcements</h3>
                  <div className="stat-value">{classroom.announcements.length}</div>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon success"><MessageSquare size={28} /></div>
                <div className="stat-content">
                  <h3>Discussion Posts</h3>
                  <div className="stat-value">{classroom.discussion.length}</div>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ padding: '20px' }}>
                <div className="stat-icon warning"><Users size={28} /></div>
                <div className="stat-content">
                  <h3>Open Assignments</h3>
                  <div className="stat-value">{classroom.assignments.filter((assignment) => assignment.submissionStatus !== 'graded').length}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ marginBottom: '6px' }}>Live Class & Updates</h2>
                    <p className="text-muted">{selectedCourse.name} classroom stream</p>
                  </div>
                  {liveClassLink && (
                    <a
                      className="btn btn-primary"
                      href={liveClassLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <PlayCircle size={18} />
                      <span>Join Live</span>
                    </a>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {classroom.announcements.length === 0 ? (
                    <p className="text-muted">No classroom announcements yet.</p>
                  ) : (
                    classroom.announcements.slice(0, 5).map((announcement) => (
                      <div key={announcement._id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                          <strong>{announcement.title}</strong>
                          {announcement.isPinned && <span className="badge" style={{ position: 'static', background: 'rgba(245, 158, 11, 0.18)', color: 'var(--warning)', border: 'none' }}>Pinned</span>}
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{announcement.body}</p>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(announcement.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Study Materials</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {classroom.materials.length === 0 ? (
                    <p className="text-muted">No materials uploaded yet.</p>
                  ) : (
                    classroom.materials.map((material) => (
                      <div key={material._id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                          <div>
                            <strong>{material.title}</strong>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                              {material.resourceType} {material.weekLabel ? `• ${material.weekLabel}` : ''}
                            </div>
                          </div>
                          {material.externalUrl ? (
                            <a href={material.externalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>
                              <ExternalLink size={18} />
                            </a>
                          ) : null}
                        </div>
                        {material.description && (
                          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{material.description}</p>
                        )}
                        {material.files?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {material.files.map((file) => (
                              <a
                                key={file.filename}
                                href={getAssetUrl(file.path)}
                                target="_blank"
                                rel="noreferrer"
                                className="badge"
                                style={{ position: 'static', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', border: 'none' }}
                              >
                                {file.originalName || file.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Assignment Snapshot</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {classroom.assignments.length === 0 ? (
                    <p className="text-muted">No assignments for this classroom yet.</p>
                  ) : (
                    classroom.assignments.slice(0, 5).map((assignment) => (
                      <div key={assignment._id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                          <strong>{assignment.title}</strong>
                          <span className="badge" style={{ position: 'static', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: 'none' }}>
                            {assignment.submissionStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Due {new Date(assignment.deadline).toLocaleString()} • Avg {assignment.averagePercentage}%
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                          {assignment.instructions || assignment.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Class Discussion</h2>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '360px', overflowY: 'auto', marginBottom: '16px' }}>
                  {classroom.discussion.length === 0 ? (
                    <p className="text-muted">No discussion yet. Start the conversation.</p>
                  ) : (
                    classroom.discussion.map((entry) => (
                      <div key={entry._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                          <strong>{entry.sender?.name}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{entry.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Ask a question or share notes..."
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'white'
                    }}
                  />
                  <button className="btn btn-primary" type="submit">
                    <Send size={18} />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentClassroom;

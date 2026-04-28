import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { ArrowLeft, Mail, Phone, Calendar, BookOpen, MessageSquare } from 'lucide-react';

const TeacherProfile = () => {
  const { teacherName } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await api.get(`/users/${teacherName}`);
        if (res.data.success) setTeacher(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTeacher();
  }, [teacherName]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim() || !teacher?._id) return;

    try {
      setSending(true);
      await api.post('/messages', {
        receiverId: teacher._id,
        content: message.trim()
      });
      setMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (!teacher) {
    return (
      <DashboardLayout title="Teacher Profile">
        <div className="glass-panel" style={{ padding: '24px' }}>Loading teacher profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Profile">
      <div className="animate-fade-in" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '980px', padding: '32px' }}>
          <button className="btn btn-secondary" style={{ marginBottom: '24px' }} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
            <div>
              <h1 style={{ marginBottom: '12px' }}>{teacher.name}</h1>
              <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
                Faculty profile with assigned subjects, teaching schedule, and a direct contact option.
              </p>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={18} />
                  <strong>Department:</strong>
                  <span>{teacher.department}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} />
                  <strong>Email:</strong>
                  <span>{teacher.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} />
                  <strong>Phone:</strong>
                  <span>{teacher.phone || 'Phone not available'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} />
                  <strong>Weekly Slots:</strong>
                  <span>{teacher.schedule?.length || 0}</span>
                </div>
              </div>

              <form onSubmit={sendMessage} style={{ marginTop: '28px', display: 'grid', gap: '12px' }}>
                <label style={{ fontWeight: 600 }}>Contact Faculty</label>
                <textarea
                  rows="4"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a message to your faculty member..."
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                ></textarea>
                <button className="btn btn-primary" type="submit" disabled={sending} style={{ justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                  <span>{sending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
                <h3 style={{ marginBottom: '16px' }}>Subjects Taught</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {teacher.taughtCourses?.length === 0 ? (
                    <p className="text-muted">No courses available.</p>
                  ) : (
                    teacher.taughtCourses.map((course) => (
                      <div key={course._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{ fontWeight: 600 }}>{course.code} • {course.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Semester {course.semester} • {course.enrolledStudents?.length || 0} students
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
                <h3 style={{ marginBottom: '16px' }}>Teaching Schedule</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {teacher.schedule?.length === 0 ? (
                    <p className="text-muted">No timetable slots configured.</p>
                  ) : (
                    teacher.schedule.map((slot) => (
                      <div key={slot._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{ fontWeight: 600 }}>{slot.day}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          {slot.startTime}-{slot.endTime} • {slot.course?.code} • {slot.room}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherProfile;

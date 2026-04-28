import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { BookOpen, Megaphone, MessageSquare, Upload } from 'lucide-react';

const initialAnnouncement = {
  title: '',
  body: '',
  category: 'classroom',
  meetingLink: '',
  isPinned: false
};

const initialMaterial = {
  title: '',
  description: '',
  resourceType: 'document',
  externalUrl: '',
  weekLabel: '',
  subject: '',
  tags: ''
};

const FacultyClassroomManager = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [announcementForm, setAnnouncementForm] = useState(initialAnnouncement);
  const [materialForm, setMaterialForm] = useState(initialMaterial);
  const [materialFile, setMaterialFile] = useState(null);
  const [classroom, setClassroom] = useState({ announcements: [], materials: [], discussion: [] });

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.data);
        if (res.data.data.length > 0) setSelectedCourseId(res.data.data[0]._id);
      }
    };
    fetchCourses().catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchClassroom = async () => {
      const [announcementRes, materialRes, discussionRes] = await Promise.all([
        api.get(`/announcements?courseId=${selectedCourseId}`),
        api.get(`/materials?courseId=${selectedCourseId}`),
        api.get(`/messages/classroom/${selectedCourseId}`)
      ]);

      setClassroom({
        announcements: announcementRes.data.success ? announcementRes.data.data : [],
        materials: materialRes.data.success ? materialRes.data.data : [],
        discussion: discussionRes.data.success ? discussionRes.data.data : []
      });
    };

    fetchClassroom().catch(console.error);
  }, [selectedCourseId]);

  const publishAnnouncement = async (event) => {
    event.preventDefault();
    await api.post('/announcements', {
      ...announcementForm,
      course: selectedCourseId,
      targetRoles: ['student']
    });
    setAnnouncementForm(initialAnnouncement);
    const res = await api.get(`/announcements?courseId=${selectedCourseId}`);
    if (res.data.success) setClassroom((current) => ({ ...current, announcements: res.data.data }));
  };

  const uploadMaterial = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries({ ...materialForm, courseId: selectedCourseId }).forEach(([key, value]) => data.append(key, value));
    if (materialFile) data.append('files', materialFile);

    await api.post('/materials', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    setMaterialForm(initialMaterial);
    setMaterialFile(null);
    const res = await api.get(`/materials?courseId=${selectedCourseId}`);
    if (res.data.success) setClassroom((current) => ({ ...current, materials: res.data.data }));
  };

  return (
    <DashboardLayout title="Classroom Manager">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}>Faculty Classroom Control</h1>
            <p className="text-muted">Publish updates, attach live links, upload materials, and monitor class discussion.</p>
          </div>
          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            style={{ padding: '12px 14px', minWidth: '260px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.code} - {course.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Megaphone size={18} />
              <h2 style={{ margin: 0 }}>Post Announcement</h2>
            </div>
            <form onSubmit={publishAnnouncement} style={{ display: 'grid', gap: '12px' }}>
              <input required value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} placeholder="Announcement title" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
              <textarea required rows="4" value={announcementForm.body} onChange={(event) => setAnnouncementForm({ ...announcementForm, body: event.target.value })} placeholder="Share instructions, class update, or notice..." style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}></textarea>
              <select value={announcementForm.category} onChange={(event) => setAnnouncementForm({ ...announcementForm, category: event.target.value })} style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                <option value="classroom">Classroom Update</option>
                <option value="live-class">Live Class Link</option>
                <option value="deadline">Deadline Reminder</option>
              </select>
              <input value={announcementForm.meetingLink} onChange={(event) => setAnnouncementForm({ ...announcementForm, meetingLink: event.target.value })} placeholder="Meeting / live class link (optional)" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={announcementForm.isPinned} onChange={(event) => setAnnouncementForm({ ...announcementForm, isPinned: event.target.checked })} />
                Pin this announcement
              </label>
              <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>Publish</button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Upload size={18} />
              <h2 style={{ margin: 0 }}>Upload Material</h2>
            </div>
            <form onSubmit={uploadMaterial} style={{ display: 'grid', gap: '12px' }}>
              <input required value={materialForm.title} onChange={(event) => setMaterialForm({ ...materialForm, title: event.target.value })} placeholder="Resource title" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
              <textarea rows="3" value={materialForm.description} onChange={(event) => setMaterialForm({ ...materialForm, description: event.target.value })} placeholder="What should students know about this resource?" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}></textarea>
              <select value={materialForm.resourceType} onChange={(event) => setMaterialForm({ ...materialForm, resourceType: event.target.value })} style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="live-class">Live Class Resource</option>
              </select>
              <input value={materialForm.externalUrl} onChange={(event) => setMaterialForm({ ...materialForm, externalUrl: event.target.value })} placeholder="External link (optional)" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
              <input value={materialForm.subject} onChange={(event) => setMaterialForm({ ...materialForm, subject: event.target.value })} placeholder="Subject / topic label" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
              <input value={materialForm.weekLabel} onChange={(event) => setMaterialForm({ ...materialForm, weekLabel: event.target.value })} placeholder="Week label (e.g. Week 3)" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
              <input value={materialForm.tags} onChange={(event) => setMaterialForm({ ...materialForm, tags: event.target.value })} placeholder="Tags separated by commas" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
              <input type="file" onChange={(event) => setMaterialFile(event.target.files[0])} style={{ color: 'var(--text-secondary)' }} />
              <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>Upload Resource</button>
            </form>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '16px' }}>Recent Announcements</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {classroom.announcements.slice(0, 5).map((announcement) => (
                <div key={announcement._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                  <strong>{announcement.title}</strong>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{announcement.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <BookOpen size={18} />
              <h2 style={{ margin: 0 }}>Uploaded Materials</h2>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {classroom.materials.slice(0, 5).map((material) => (
                <div key={material._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                  <strong>{material.title}</strong>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{material.resourceType} • {material.subject || 'General'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <MessageSquare size={18} />
              <h2 style={{ margin: 0 }}>Discussion Feed</h2>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {classroom.discussion.slice(-5).reverse().map((entry) => (
                <div key={entry._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                  <strong>{entry.sender?.name}</strong>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{entry.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyClassroomManager;

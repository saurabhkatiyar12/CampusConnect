import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Plus, Search, FileText, Clock, Users, ChevronDown } from 'lucide-react';

const AssignmentManager = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '', description: '', courseId: '', deadline: '', maxMarks: 100, allowLateSubmission: false
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assnRes, courseRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/courses')
      ]);
      if (assnRes.data.success) setAssignments(assnRes.data.data);
      if (courseRes.data.success) setCourses(courseRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('files', file);

    try {
      await api.post('/assignments', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  return (
    <DashboardLayout title="Assignment Manager">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="page-actions">
          <div className="search-box glass-panel">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search assignments..." />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            <span>{showForm ? 'Cancel' : 'Create Assignment'}</span>
          </button>
        </div>

        {showForm && (
          <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>Create New Assignment</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <div className="input-group">
                <label>Title</label>
                <input required type="text" className="input-wrapper" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Course</label>
                <select required style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                  <option value="">Select Course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea required rows="3" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label>Deadline</label>
                <input required type="datetime-local" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Max Marks</label>
                <input required type="number" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Attachment (Optional)</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} style={{ padding: '10px', color: 'var(--text-secondary)' }} />
              </div>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.allowLateSubmission} onChange={e => setFormData({...formData, allowLateSubmission: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                <label>Allow Late Submission</label>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Assignment</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {loading ? <p>Loading assignments...</p> : assignments.length === 0 ? <p className="text-muted">No assignments created yet.</p> : (
            assignments.map(assn => {
              const isExpired = new Date() > new Date(assn.deadline);
              return (
                <div key={assn._id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                  {isExpired && <div style={{ position: 'absolute', top: '16px', right: '-30px', background: 'var(--danger)', fontSize: '10px', padding: '4px 30px', transform: 'rotate(45deg)', fontWeight: 'bold' }}>EXPIRED</div>}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', marginBottom: '8px' }}>{assn.course.code}</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{assn.title}</h3>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {assn.description}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{new Date(assn.deadline).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Users size={14} />
                      <span>View Submissions</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '13px', justifyContent: 'center' }}>
                      Grade Submissions
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AssignmentManager;

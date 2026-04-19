import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { FileText, Clock, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssn, setSelectedAssn] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      if (res.data.success) setAssignments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload");
    setSubmitting(true);
    
    const data = new FormData();
    data.append('assignmentId', selectedAssn._id);
    data.append('files', file);

    try {
      await api.post('/assignments/submit', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert("Assignment submitted successfully!");
      setSelectedAssn(null);
      setFile(null);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="My Assignments">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {loading ? <p>Loading...</p> : assignments.length === 0 ? <p className="text-muted">No pending assignments.</p> : (
            assignments.map(assn => {
              const isLate = new Date() > new Date(assn.deadline);
              
              return (
                <div key={assn._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>{assn.course.name}</span>
                    {isLate && !assn.allowLateSubmission ? (
                      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>Closed</span>
                    ) : isLate ? (
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>Late Allowed</span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>Active</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{assn.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{assn.description}</p>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isLate ? 'var(--danger)' : 'var(--text-primary)' }}>
                    <Clock size={16} />
                    <span style={{ fontWeight: '500' }}>Due: {new Date(assn.deadline).toLocaleString()}</span>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                    onClick={() => setSelectedAssn(assn)}
                    disabled={isLate && !assn.allowLateSubmission}
                  >
                    <Upload size={18} />
                    <span>Submit Work</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Submission Modal Overlay */}
        {selectedAssn && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
              <h2 style={{ marginBottom: '8px' }}>Submit Assignment</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{selectedAssn.title}</p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ border: '2px dashed var(--glass-border)', padding: '40px', borderRadius: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  <FileText size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                  <input type="file" id="file-upload" required onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: '500' }}>
                    {file ? file.name : 'Click to browse files'}
                  </label>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => { setSelectedAssn(null); setFile(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Upload & Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AssignmentList;

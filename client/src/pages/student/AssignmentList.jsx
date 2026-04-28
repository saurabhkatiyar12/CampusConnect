import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Clock, FileText, Upload, Trophy, AlertTriangle } from 'lucide-react';

const formatCountdown = (milliseconds) => {
  if (milliseconds <= 0) return 'Deadline reached';
  const totalHours = Math.floor(milliseconds / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${hours}h left`;
};

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssn, setSelectedAssn] = useState(null);
  const [file, setFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file && !submissionText.trim()) return;
    setSubmitting(true);

    const data = new FormData();
    data.append('assignmentId', selectedAssn._id);
    data.append('submissionText', submissionText);
    if (file) data.append('files', file);

    try {
      await api.post('/assignments/submit', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSelectedAssn(null);
      setFile(null);
      setSubmissionText('');
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
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h1 style={{ marginBottom: '8px' }}>Assignment Lifecycle</h1>
          <p className="text-muted">Track deadlines, submission status, grades, feedback, versions, and class performance.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {loading ? <p>Loading...</p> : assignments.length === 0 ? <p className="text-muted">No assignments available.</p> : (
            assignments.map((assignment) => {
              const closed = assignment.submissionStatus === 'closed';
              const mySubmission = assignment.mySubmission;

              return (
                <div key={assignment._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <span className="badge" style={{ position: 'static', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: 'none' }}>
                        {assignment.course.code}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '10px' }}>{assignment.title}</h3>
                    </div>
                    <span
                      className="badge"
                      style={{
                        position: 'static',
                        background: assignment.submissionStatus === 'graded'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : assignment.submissionStatus === 'late'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : assignment.submissionStatus === 'submitted'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                        color: assignment.submissionStatus === 'graded'
                          ? 'var(--success)'
                          : assignment.submissionStatus === 'late'
                            ? 'var(--warning)'
                            : assignment.submissionStatus === 'submitted'
                              ? 'var(--info)'
                              : 'var(--danger)',
                        border: 'none'
                      }}
                    >
                      {assignment.submissionStatus}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{assignment.instructions || assignment.description}</p>

                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Clock size={16} />
                      <span>Due: {new Date(assignment.deadline).toLocaleString()} • {formatCountdown(assignment.countdownMs)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Trophy size={16} />
                      <span>Class average: {assignment.averagePercentage}% • Max marks: {assignment.maxMarks}</span>
                    </div>
                    {mySubmission && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <AlertTriangle size={16} />
                        <span>
                          Versions: {mySubmission.versionHistory?.length ? mySubmission.versionHistory.length + 1 : 1}
                          {typeof mySubmission.plagiarismScore === 'number' ? ` • Similarity: ${mySubmission.plagiarismScore}%` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {mySubmission?.status === 'graded' && (
                    <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)' }}>
                      <div style={{ fontWeight: 600 }}>Graded: {mySubmission.grade}/{assignment.maxMarks}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {mySubmission.feedback || 'Faculty feedback will appear here.'}
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                    onClick={() => {
                      setSelectedAssn(assignment);
                      setSubmissionText(mySubmission?.submissionText || '');
                    }}
                    disabled={closed}
                  >
                    <Upload size={18} />
                    <span>{mySubmission ? 'Update Submission' : 'Submit Work'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {selectedAssn && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '560px', padding: '32px' }}>
              <h2 style={{ marginBottom: '8px' }}>{selectedAssn.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {selectedAssn.instructions || selectedAssn.description}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ border: '2px dashed var(--glass-border)', padding: '28px', borderRadius: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  <FileText size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                  <input type="file" id="file-upload" onChange={(event) => setFile(event.target.files[0])} style={{ display: 'none' }} />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: '500' }}>
                    {file ? file.name : 'Click to browse files'}
                  </label>
                </div>

                <textarea
                  rows="4"
                  value={submissionText}
                  onChange={(event) => setSubmissionText(event.target.value)}
                  placeholder="Add submission notes or a short written answer to improve review and similarity checks..."
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                ></textarea>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => { setSelectedAssn(null); setFile(null); setSubmissionText(''); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? 'Saving...' : 'Upload Submission'}
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

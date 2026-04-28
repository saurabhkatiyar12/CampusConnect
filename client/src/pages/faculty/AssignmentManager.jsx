import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Plus, Search, Clock, Users, CheckCircle2, Trophy } from 'lucide-react';

const AssignmentManager = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionData, setSubmissionData] = useState({ submissions: [], summary: null });
  const [gradeDrafts, setGradeDrafts] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    courseId: '',
    deadline: '',
    maxMarks: 100,
    allowLateSubmission: false,
    estimatedMinutes: 60,
    submissionType: 'file'
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentRes, courseRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/courses')
      ]);
      if (assignmentRes.data.success) setAssignments(assignmentRes.data.data);
      if (courseRes.data.success) setCourses(courseRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openSubmissions = async (assignment) => {
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      if (res.data.success) {
        setActiveAssignment(assignment);
        setSubmissionData(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (file) data.append('files', file);

    try {
      await api.post('/assignments', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        instructions: '',
        courseId: '',
        deadline: '',
        maxMarks: 100,
        allowLateSubmission: false,
        estimatedMinutes: 60,
        submissionType: 'file'
      });
      setFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const submitGrade = async (submissionId) => {
    const draft = gradeDrafts[submissionId];
    if (!draft?.grade) return;

    try {
      await api.put(`/assignments/grade/${submissionId}`, {
        grade: draft.grade,
        feedback: draft.feedback || ''
      });
      if (activeAssignment) openSubmissions(activeAssignment);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save grade');
    }
  };

  const stats = {
    total: assignments.length,
    graded: assignments.filter((assignment) => assignment.gradedCount > 0).length,
    pendingReviews: assignments.reduce((sum, assignment) => sum + (assignment.submittedCount - assignment.gradedCount), 0),
    lateSubmissions: assignments.reduce((sum, assignment) => sum + assignment.lateCount, 0)
  };

  return (
    <DashboardLayout title="Assignment Manager">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon primary"><Trophy size={28} /></div>
            <div className="stat-content"><h3>Assignments</h3><div className="stat-value">{stats.total}</div></div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon success"><CheckCircle2 size={28} /></div>
            <div className="stat-content"><h3>With Grading</h3><div className="stat-value">{stats.graded}</div></div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon warning"><Users size={28} /></div>
            <div className="stat-content"><h3>Pending Reviews</h3><div className="stat-value">{stats.pendingReviews}</div></div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon info"><Clock size={28} /></div>
            <div className="stat-content"><h3>Late Submissions</h3><div className="stat-value">{stats.lateSubmissions}</div></div>
          </div>
        </div>

        <div className="page-actions">
          <div className="search-box glass-panel">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Assignments are sorted by nearest deadline..." readOnly />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            <span>{showForm ? 'Cancel' : 'Create Assignment'}</span>
          </button>
        </div>

        {showForm && (
          <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>Create New Assignment</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <input required placeholder="Title" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} />
              <select required style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.courseId} onChange={(event) => setFormData({ ...formData, courseId: event.target.value })}>
                <option value="">Select Course...</option>
                {courses.map((course) => <option key={course._id} value={course._id}>{course.code} - {course.name}</option>)}
              </select>
              <input required type="datetime-local" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.deadline} onChange={(event) => setFormData({ ...formData, deadline: event.target.value })} />
              <input required type="number" placeholder="Max Marks" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.maxMarks} onChange={(event) => setFormData({ ...formData, maxMarks: event.target.value })} />
              <input type="number" placeholder="Estimated Minutes" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.estimatedMinutes} onChange={(event) => setFormData({ ...formData, estimatedMinutes: event.target.value })} />
              <select style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.submissionType} onChange={(event) => setFormData({ ...formData, submissionType: event.target.value })}>
                <option value="file">File Upload</option>
                <option value="text">Text Answer</option>
                <option value="mixed">Mixed</option>
              </select>
              <textarea required rows="3" placeholder="Description" style={{ gridColumn: '1 / -1', padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })}></textarea>
              <textarea rows="4" placeholder="Detailed instructions / rubric" style={{ gridColumn: '1 / -1', padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }} value={formData.instructions} onChange={(event) => setFormData({ ...formData, instructions: event.target.value })}></textarea>
              <input type="file" onChange={(event) => setFile(event.target.files[0])} style={{ color: 'var(--text-secondary)' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.allowLateSubmission} onChange={(event) => setFormData({ ...formData, allowLateSubmission: event.target.checked })} />
                Allow Late Submission
              </label>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">Publish Assignment</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {loading ? <p>Loading assignments...</p> : assignments.length === 0 ? <p className="text-muted">No assignments created yet.</p> : assignments.map((assignment) => (
            <div key={assignment._id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <span className="badge" style={{ position: 'static', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: 'none' }}>{assignment.course.code}</span>
                  <h3 style={{ marginTop: '10px' }}>{assignment.title}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{assignment.averagePercentage}%</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>class avg</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{assignment.instructions || assignment.description}</p>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.18)', display: 'grid', gap: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Due {new Date(assignment.deadline).toLocaleString()}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Submitted {assignment.submittedCount} • Graded {assignment.gradedCount} • Pending {assignment.pendingCount} • Late {assignment.lateCount}
                </div>
              </div>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => openSubmissions(assignment)}>
                Review Submissions
              </button>
            </div>
          ))}
        </div>

        {activeAssignment && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 100, padding: '20px', overflowY: 'auto' }}>
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '980px', margin: '20px auto', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ marginBottom: '6px' }}>{activeAssignment.title}</h2>
                  <p className="text-muted">Submission review, grading, feedback, and similarity monitoring.</p>
                </div>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setActiveAssignment(null)}>Close</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div className="glass-panel" style={{ padding: '16px' }}><strong>{submissionData.summary?.submittedCount || 0}</strong><div className="text-muted">Submitted</div></div>
                <div className="glass-panel" style={{ padding: '16px' }}><strong>{submissionData.summary?.gradedCount || 0}</strong><div className="text-muted">Graded</div></div>
                <div className="glass-panel" style={{ padding: '16px' }}><strong>{submissionData.summary?.pendingCount || 0}</strong><div className="text-muted">Pending</div></div>
                <div className="glass-panel" style={{ padding: '16px' }}><strong>{submissionData.summary?.averagePercentage || 0}%</strong><div className="text-muted">Class Average</div></div>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {submissionData.submissions.map((submission) => (
                  <div key={submission._id} className="glass-panel" style={{ padding: '20px', display: 'grid', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <strong>{submission.student.name}</strong>
                        <div className="text-muted" style={{ fontSize: '13px' }}>{submission.student.rollNo} • {submission.student.email}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(submission.submittedAt).toLocaleString()}</div>
                        <div style={{ fontSize: '13px', color: submission.isLate ? 'var(--warning)' : 'var(--success)' }}>
                          {submission.isLate ? 'Late submission' : 'On time'}
                        </div>
                      </div>
                    </div>

                    {submission.submissionText && (
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {submission.submissionText}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ position: 'static', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)', border: 'none' }}>
                        Similarity {submission.plagiarismScore || 0}%
                      </span>
                      <span className="badge" style={{ position: 'static', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: 'none' }}>
                        Versions {(submission.versionHistory?.length || 0) + 1}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '12px', alignItems: 'start' }}>
                      <input
                        type="number"
                        min="0"
                        max={activeAssignment.maxMarks}
                        placeholder={`Marks / ${activeAssignment.maxMarks}`}
                        value={gradeDrafts[submission._id]?.grade ?? submission.grade ?? ''}
                        onChange={(event) => setGradeDrafts((current) => ({
                          ...current,
                          [submission._id]: {
                            ...current[submission._id],
                            grade: event.target.value
                          }
                        }))}
                        style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                      />
                      <textarea
                        rows="3"
                        placeholder="Write faculty feedback..."
                        value={gradeDrafts[submission._id]?.feedback ?? submission.feedback ?? ''}
                        onChange={(event) => setGradeDrafts((current) => ({
                          ...current,
                          [submission._id]: {
                            ...current[submission._id],
                            feedback: event.target.value
                          }
                        }))}
                        style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                      ></textarea>
                      <button className="btn btn-primary" onClick={() => submitGrade(submission._id)} style={{ justifyContent: 'center' }}>
                        Save Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentManager;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Mail, Phone, Star, Users } from 'lucide-react';

const StudentTeachers = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get('/users/faculty-directory');
        if (res.data.success) setFaculty(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  return (
    <DashboardLayout title="Teacher Network">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h1 style={{ marginBottom: '8px' }}>Faculty Directory</h1>
          <p className="text-muted">Discover assigned faculty, subjects taught, schedule snapshots, and direct contact options.</p>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '24px' }}>Loading teacher profiles...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {faculty.map((teacher) => (
              <button
                key={teacher._id}
                type="button"
                className="glass-panel"
                onClick={() => navigate(`/student/teacher/${teacher._id}`)}
                style={{ padding: '24px', textAlign: 'left', display: 'grid', gap: '14px', border: '1px solid var(--glass-border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
                  <div>
                    <h2 style={{ marginBottom: '6px' }}>{teacher.name}</h2>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{teacher.department}</div>
                  </div>
                  <div className="badge" style={{ position: 'static', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: 'none' }}>
                    {teacher.subjects.length} subject{teacher.subjects.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Mail size={16} />
                    <span>{teacher.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Phone size={16} />
                    <span>{teacher.phone || 'Phone not available'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Users size={16} />
                    <span>Semesters: {teacher.semesters.join(', ') || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Star size={15} className="text-warning" />
                    <strong>Assigned Subjects</strong>
                  </div>
                  {teacher.subjects.slice(0, 3).map((subject) => (
                    <div key={subject._id} style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {subject.code} • {subject.name}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentTeachers;

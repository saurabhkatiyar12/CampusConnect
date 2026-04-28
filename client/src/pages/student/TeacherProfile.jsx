import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ArrowLeft, Mail, Phone, Calendar, BookOpen, Users } from 'lucide-react';

const teacherProfiles = {
  'dr-mehta': {
    name: 'Dr. Mehta',
    department: 'Computer Science',
    email: 'dr.mehta@campusconnect.edu',
    phone: '+91 98765 43210',
    officeHours: 'Tuesdays 2:00 PM - 4:00 PM',
    courses: ['Algorithms', 'Data Structures', 'System Design'],
    bio: 'Experienced faculty in computer science with a focus on practical application and mentoring.'
  },
  'ms-sharma': {
    name: 'Ms. Sharma',
    department: 'Mathematics',
    email: 'ms.sharma@campusconnect.edu',
    phone: '+91 91234 56789',
    officeHours: 'Weekends 10:00 AM - 12:00 PM',
    courses: ['Calculus', 'Linear Algebra', 'Statistics'],
    bio: 'Mathematics faculty dedicated to helping students succeed in core quantitative subjects.'
  },
  'mr-singh': {
    name: 'Mr. Singh',
    department: 'Soft Skills',
    email: 'mr.singh@campusconnect.edu',
    phone: '+91 99876 54321',
    officeHours: 'Fridays 3:00 PM - 5:00 PM',
    courses: ['Communication Skills', 'Presentation Skills', 'Interview Prep'],
    bio: 'Soft skills coach who helps students build confidence for presentations and interviews.'
  }
};

const TeacherProfile = () => {
  const { teacherName } = useParams();
  const navigate = useNavigate();
  const teacher = teacherProfiles[teacherName] || {
    name: 'Unknown Teacher',
    department: 'N/A',
    email: 'N/A',
    phone: 'N/A',
    officeHours: 'N/A',
    courses: [],
    bio: 'No profile available for this teacher.'
  };

  return (
    <DashboardLayout title="Teacher Profile">
      <div className="animate-fade-in" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '860px', padding: '32px' }}>
          <button className="btn btn-secondary" style={{ marginBottom: '24px' }} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            <div>
              <h1 style={{ marginBottom: '12px' }}>{teacher.name}</h1>
              <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>{teacher.bio}</p>

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
                  <span>{teacher.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} />
                  <strong>Office Hours:</strong>
                  <span>{teacher.officeHours}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
              <h3 style={{ marginBottom: '16px' }}>Courses Taught</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {teacher.courses.length === 0 ? (
                  <p className="text-muted">No courses available.</p>
                ) : (
                  teacher.courses.map((course) => (
                    <div key={course} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={16} />
                      <span>{course}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherProfile;

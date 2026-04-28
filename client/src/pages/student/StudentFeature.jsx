import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ArrowLeft, Calendar, Users } from 'lucide-react';

const sampleContent = {
  Classroom: [
    { title: 'Live Lecture', detail: 'Tomorrow 10:00 AM - Database Systems live session with interactive Q&A and practical walkthroughs.' },
    { title: 'Course Resources', detail: 'Download lecture slides, sample code, practice quizzes, and reading notes for the week.' },
    { title: 'Discussion Forum', detail: 'Post questions, share study notes, and collaborate with classmates on assignment topics.' }
  ],
  Grade: [
    { title: 'Semester 1', detail: 'CGPA 8.2 — strong improvement in core subjects.' },
    { title: 'Semester 2', detail: 'CGPA 8.6 — excellent performance in practicals.' },
    { title: 'Grade Trends', detail: 'Your average has increased by 5% since last semester.' }
  ],
  Subject: [
    { title: 'Computer Science', detail: 'Focus areas: Algorithms, Data Structures, and Web Development.' },
    { title: 'Mathematics', detail: 'Topics: Calculus, Linear Algebra and Statistics.' },
    { title: 'Communication Skills', detail: 'Improve presentation and writing performance.' }
  ],
  Teacher: [
    { title: 'Dr. Mehta', detail: 'Computer Science faculty, available Tuesdays 2-4 PM.', slug: 'dr-mehta' },
    { title: 'Ms. Sharma', detail: 'Mathematics faculty, available for extra help on weekends.', slug: 'ms-sharma' },
    { title: 'Mr. Singh', detail: 'Soft Skills instructor, organizes monthly workshops.', slug: 'mr-singh' }
  ],
  'Subject Routing': [
    { title: 'Past Subjects', detail: 'Completed subjects: Data Structures, Discrete Mathematics, Digital Logic, and Soft Skills.' },
    { title: 'Upcoming Subjects', detail: 'Planned for next semester: Operating Systems, Database Systems, Professional Communication, and Web Design.' },
    { title: 'Academic Plan', detail: 'Prepare for project milestones, lab work, and elective selection over the next 8 weeks.' }
  ],
  Timetable: [
    { title: 'Tomorrow', detail: '09:00 AM - Data Structures, 11:00 AM - Operating Systems, 02:00 PM - Professional Communication.' },
    { title: 'Day After Tomorrow', detail: '10:30 AM - Discrete Mathematics, 01:00 PM - Web Design, 03:00 PM - Lecture Review.' },
    { title: 'Thursday', detail: '09:00 AM - Database Systems, 12:00 PM - Soft Skills Workshop, 04:00 PM - Team Project Session.' }
  ],
  Student: [
    { title: 'Profile Summary', detail: 'View your personal details, attendance and activity status.' },
    { title: 'Student ID', detail: 'Maintain access to campus services and exam records.' },
    { title: 'Support', detail: 'Contact student support for administrative help.' }
  ],
  'Student Payment': [
    { title: 'Fee Due', detail: 'Your next tuition installment is due on May 10.' },
    { title: 'Payment History', detail: 'Review past fee transactions and receipts.' },
    { title: 'Scholarship', detail: 'Check eligibility and submit your application.' }
  ],
  Attendance: [
    { title: 'Attendance Percent', detail: 'Your total attendance is 89% across enrolled courses.' },
    { title: 'Recent Scans', detail: 'Last scanned session: Database Systems on April 27.' },
    { title: 'Attendance Alerts', detail: 'You have 2 low attendance warnings in elective courses.' }
  ],
  Exam: [
    { title: 'Upcoming Exam', detail: 'Database Systems midterm on May 5 at 9:00 AM.' },
    { title: 'Exam Results', detail: 'Check past exam scores and overall ranking.' },
    { title: 'Exam Prep', detail: 'View recommended practice tests and notes.' }
  ],
  Event: [
    { title: 'Upcoming Event', detail: 'Tech Fest & Hackathon on May 15 with keynote sessions, competitions, and internship showcases.' },
    { title: 'Registration', detail: 'Register before May 8 to join the coding sprint and workshop tracks.' },
    { title: 'Alerts', detail: 'Event alerts will notify you about schedule changes and venue updates.' }
  ]
};

const StudentFeature = ({ title, description }) => {
  const navigate = useNavigate();
  const items = sampleContent[title] || [];

  return (
    <DashboardLayout title={title}>
      <div className="animate-fade-in" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ marginBottom: '8px' }}>{title}</h1>
              <p className="text-muted">{description || 'This student feature is available here as a placeholder page while the module is developed.'}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/student')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={18} /> Back
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {items.map((item, index) => {
              const isTeacherCard = title === 'Teacher' && item.slug;
              const cardStyle = {
                padding: '20px',
                border: '1px solid var(--glass-border)',
                textAlign: 'left',
                background: 'transparent',
                cursor: isTeacherCard ? 'pointer' : 'default',
                transition: isTeacherCard ? 'all 0.2s ease' : undefined
              };

              const cardContent = (
                <>
                  <h3 style={{ marginBottom: '12px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.detail}</p>
                  {isTeacherCard && <p style={{ marginTop: '16px', color: 'var(--accent-primary)', fontSize: '13px' }}>View profile</p>}
                </>
              );

              return isTeacherCard ? (
                <button
                  key={index}
                  type="button"
                  className="glass-panel"
                  onClick={() => navigate(`/student/teacher/${item.slug}`)}
                  style={cardStyle}
                >
                  {cardContent}
                </button>
              ) : (
                <div key={index} className="glass-panel" style={cardStyle}>
                  {cardContent}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '28px', padding: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={18} className="text-primary" />
              <span style={{ fontWeight: '600' }}>Quick action</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Use the dashboard buttons to navigate between your student modules. Sample content is provided here for the selected section.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentFeature;

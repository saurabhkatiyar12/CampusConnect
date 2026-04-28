import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ArrowLeft, BookOpen, Calendar, Users, CreditCard, Trophy, Bell } from 'lucide-react';

const sampleContent = {
  Classroom: [
    { title: 'Live Lecture', detail: 'Join the classroom session for Mathematics at 10:00 AM.' },
    { title: 'Course Resources', detail: 'Download your lecture notes and practice assignments.' },
    { title: 'Discussion Forum', detail: 'Ask questions and collaborate with your classmates.' }
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
    { title: 'Dr. Mehta', detail: 'Computer Science faculty, available Tuesdays 2-4 PM.' },
    { title: 'Ms. Sharma', detail: 'Mathematics faculty, available for extra help on weekends.' },
    { title: 'Mr. Singh', detail: 'Soft Skills instructor, organizes monthly workshops.' }
  ],
  'Subject Routing': [
    { title: 'Core Subjects', detail: 'Computer Science, Mathematics, and Applied Physics.' },
    { title: 'Electives', detail: 'Web Design, Machine Learning, and Business Communication.' },
    { title: 'Progress Map', detail: 'View your recommended subjects for the next semester.' }
  ],
  Timetable: [
    { title: 'Monday', detail: '09:00 AM - Data Structures, 01:00 PM - Digital Logic.' },
    { title: 'Wednesday', detail: '10:30 AM - Mathematics, 03:00 PM - Elective Lab.' },
    { title: 'Friday', detail: '11:00 AM - Soft Skills, 02:00 PM - Project Review.' }
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
  'Petty Cash': [
    { title: 'Balance', detail: 'Available petty cash: ₹1200.' },
    { title: 'Expense Log', detail: 'Track small expenses for transport and supplies.' },
    { title: 'Request Funds', detail: 'Submit a petty cash request for campus events.' }
  ],
  Friends: [
    { title: 'Classmates', detail: 'See classmates enrolled in your current subjects.' },
    { title: 'Study Groups', detail: 'Join group study sessions and peer meetups.' },
    { title: 'Messages', detail: 'Chat with friends for project collaboration.' }
  ],
  Event: [
    { title: 'Upcoming Event', detail: 'Tech fest on May 15 with workshops and competitions.' },
    { title: 'Registration', detail: 'Register for the coding hackathon by May 8.' },
    { title: 'Alerts', detail: 'Get event reminders and venue updates.' }
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
            {items.map((item, index) => (
              <div key={index} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.detail}</p>
              </div>
            ))}
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

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { BookOpen, GraduationCap, Layers3, UserSquare2 } from 'lucide-react';

const StudentSubjects = () => {
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, timetableRes, performanceRes] = await Promise.all([
          api.get('/courses'),
          api.get('/timetable'),
          api.get('/assignments/performance/me')
        ]);
        if (courseRes.data.success) setCourses(courseRes.data.data);
        if (timetableRes.data.success) setTimetable(timetableRes.data.data.slots);
        if (performanceRes.data.success) setPerformance(performanceRes.data.data.byCourse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const performanceMap = useMemo(() => performance.reduce((map, entry) => {
    map[entry.course._id] = entry;
    return map;
  }, {}), [performance]);

  const slotMap = useMemo(() => timetable.reduce((map, slot) => {
    const key = slot.course?._id;
    if (!map[key]) map[key] = [];
    map[key].push(slot);
    return map;
  }, {}), [timetable]);

  return (
    <DashboardLayout title="Subject Directory">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h1 style={{ marginBottom: '8px' }}>Subject Intelligence</h1>
          <p className="text-muted">View subjects with faculty mapping, credits, schedules, and performance context.</p>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '24px' }}>Loading subjects...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {courses.map((course) => {
              const coursePerformance = performanceMap[course._id];
              const slots = slotMap[course._id] || [];
              return (
                <div key={course._id} className="glass-panel" style={{ padding: '24px', display: 'grid', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
                    <div>
                      <span className="badge" style={{ position: 'static', background: 'rgba(99, 102, 241, 0.14)', color: 'var(--accent-primary)', border: 'none' }}>
                        {course.code}
                      </span>
                      <h2 style={{ marginTop: '12px', fontSize: '20px' }}>{course.name}</h2>
                    </div>
                    <div style={{ fontWeight: 700, color: coursePerformance?.percentage >= 60 ? 'var(--success)' : 'var(--danger)' }}>
                      {coursePerformance?.percentage ?? 0}%
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <GraduationCap size={16} />
                      <span>Semester {course.semester} • {course.credits} credits</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <UserSquare2 size={16} />
                      <span>{course.faculty?.name || 'Faculty not assigned'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Layers3 size={16} />
                      <span>{slots.length} scheduled class slot{slots.length === 1 ? '' : 's'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <BookOpen size={16} />
                      <span>{course.department} department</span>
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>Schedule Snapshot</div>
                    {slots.length === 0 ? (
                      <p className="text-muted" style={{ margin: 0 }}>No timetable slots configured yet.</p>
                    ) : (
                      slots.slice(0, 3).map((slot) => (
                        <div key={slot._id} style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          {slot.day} • {slot.startTime}-{slot.endTime} • {slot.room}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentSubjects;

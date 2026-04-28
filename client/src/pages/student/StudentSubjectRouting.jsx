import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Filter, Route } from 'lucide-react';

const StudentSubjectRouting = () => {
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, timetableRes] = await Promise.all([
          api.get('/courses'),
          api.get('/timetable')
        ]);
        if (courseRes.data.success) setCourses(courseRes.data.data);
        if (timetableRes.data.success) setTimetable(timetableRes.data.data.slots);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const semesterOptions = useMemo(() => [...new Set(courses.map((course) => course.semester))].sort((a, b) => a - b), [courses]);
  const slotMap = useMemo(() => timetable.reduce((map, slot) => {
    const key = slot.course?._id;
    if (!map[key]) map[key] = [];
    map[key].push(slot);
    return map;
  }, {}), [timetable]);

  const filteredCourses = courses.filter((course) => selectedSemester === 'all' || String(course.semester) === selectedSemester);

  return (
    <DashboardLayout title="Subject Routing">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h1 style={{ marginBottom: '8px' }}>Subject Routing Map</h1>
              <p className="text-muted">Understand how subjects connect to faculty, classrooms, and schedule slots.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Filter size={16} />
              <select
                value={selectedSemester}
                onChange={(event) => setSelectedSemester(event.target.value)}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white'
                }}
              >
                <option value="all">All semesters</option>
                {semesterOptions.map((semester) => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '24px' }}>Loading subject routing...</div>
        ) : (
          <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
              <thead>
                <tr>
                  {['Subject', 'Code', 'Faculty', 'Department', 'Semester', 'Schedule', 'Room Mapping'].map((heading) => (
                    <th key={heading} style={{ padding: '14px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => {
                  const slots = slotMap[course._id] || [];
                  return (
                    <tr key={course._id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>{course.name}</td>
                      <td style={{ padding: '14px 12px' }}>{course.code}</td>
                      <td style={{ padding: '14px 12px' }}>{course.faculty?.name || 'Not assigned'}</td>
                      <td style={{ padding: '14px 12px' }}>{course.department}</td>
                      <td style={{ padding: '14px 12px' }}>Semester {course.semester}</td>
                      <td style={{ padding: '14px 12px' }}>
                        {slots.length === 0 ? (
                          <span className="text-muted">No slot assigned</span>
                        ) : (
                          slots.map((slot) => (
                            <div key={slot._id} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              {slot.day} • {slot.startTime}-{slot.endTime}
                            </div>
                          ))
                        )}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        {slots.length === 0 ? (
                          <span className="text-muted">Room pending</span>
                        ) : (
                          slots.map((slot) => (
                            <div key={`${slot._id}-room`} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              {slot.room}
                            </div>
                          ))
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Route size={18} className="text-primary" />
            <h2 style={{ margin: 0 }}>Routing Insight</h2>
          </div>
          <p className="text-muted" style={{ margin: 0 }}>
            Use this mapping to verify whether every subject has a faculty owner, a room allocation, and at least one teaching slot in the week.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSubjectRouting;

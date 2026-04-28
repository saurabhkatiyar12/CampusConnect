import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { AlertTriangle, CalendarClock, Download, MapPin } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentTimetable = () => {
  const [data, setData] = useState({
    slots: [],
    currentClass: null,
    upcomingClasses: [],
    conflicts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/timetable');
        if (res.data.success) setData(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const timeSlots = useMemo(() => (
    [...new Set(data.slots.map((slot) => `${slot.startTime}-${slot.endTime}`))]
      .sort((left, right) => left.localeCompare(right))
  ), [data.slots]);

  const slotMap = useMemo(() => (
    data.slots.reduce((map, slot) => {
      map[`${slot.day}_${slot.startTime}-${slot.endTime}`] = slot;
      return map;
    }, {})
  ), [data.slots]);

  const exportPdf = async () => {
    try {
      const res = await api.get('/timetable/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'timetable.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout title="Smart Timetable">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h1 style={{ marginBottom: '8px' }}>Interactive Timetable</h1>
              <p className="text-muted">Current classes, upcoming sessions, conflict detection, and export-ready scheduling.</p>
            </div>
            <button className="btn btn-primary" onClick={exportPdf}>
              <Download size={18} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '24px' }}>Loading timetable...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '12px' }}>Current Class</h2>
                {data.currentClass ? (
                  <div>
                    <strong>{data.currentClass.course?.name}</strong>
                    <div style={{ marginTop: '6px', color: 'var(--text-muted)' }}>
                      {data.currentClass.startTime} - {data.currentClass.endTime} • {data.currentClass.room}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">No class is active right now.</p>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '12px' }}>Upcoming Classes</h2>
                {data.upcomingClasses.length === 0 ? (
                  <p className="text-muted">No upcoming classes found.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {data.upcomingClasses.map((slot) => (
                      <div key={slot._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)' }}>
                        <strong>{slot.course?.code}</strong>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {slot.day} • {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '12px' }}>Conflict Detection</h2>
                {data.conflicts.length === 0 ? (
                  <p className="text-muted">No timetable conflicts detected.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {data.conflicts.map((conflict, index) => (
                      <div key={index} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.08)' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <AlertTriangle size={16} color="var(--danger)" />
                          <strong>{conflict.reason}</strong>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          {conflict.first.course?.code} overlaps {conflict.second.course?.code}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
              <h2 style={{ marginBottom: '16px' }}>Weekly Grid</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '14px 12px', textAlign: 'left' }}>Time</th>
                    {DAYS.map((day) => (
                      <th key={day} style={{ padding: '14px 12px', textAlign: 'left' }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{timeSlot.replace('-', ' - ')}</td>
                      {DAYS.map((day) => {
                        const slot = slotMap[`${day}_${timeSlot}`];
                        return (
                          <td key={`${day}_${timeSlot}`} style={{ padding: '10px 12px' }}>
                            {slot ? (
                              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.12)', minHeight: '92px' }}>
                                <strong>{slot.course?.code}</strong>
                                <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                                  {slot.course?.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                  <CalendarClock size={13} />
                                  <span>{slot.startTime} - {slot.endTime}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                  <MapPin size={13} />
                                  <span>{slot.room}</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ minHeight: '92px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentTimetable;

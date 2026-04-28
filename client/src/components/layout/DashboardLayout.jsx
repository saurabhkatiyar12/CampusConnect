import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Bell, User as UserIcon, Check, Award, Bookmark, LayoutList, CalendarDays, UserCheck, CreditCard, FileText, DollarSign, Calendar } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import './Layout.css';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/admin/courses', icon: <BookOpen size={20} />, label: 'Courses' },
    { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
    { to: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
  ];

  const facultyLinks = [
    { to: '/faculty', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/faculty/attendance', icon: <Users size={20} />, label: 'Attendance' },
    { to: '/faculty/assignments', icon: <BookOpen size={20} />, label: 'Assignments' },
    { to: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
  ];

  const studentLinks = [
    { to: '/student', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/profile', icon: <UserIcon size={20} />, label: 'My Profile' },
    { to: '/student/classroom', icon: <BookOpen size={20} />, label: 'Classroom' },
    { to: '/student/grade', icon: <Award size={20} />, label: 'Grade' },
    { to: '/student/subject', icon: <Bookmark size={20} />, label: 'Subject' },
    { to: '/student/teacher', icon: <Users size={20} />, label: 'Teacher' },
    { to: '/student/subject-routing', icon: <LayoutList size={20} />, label: 'Subject Routing' },
    { to: '/student/timetable', icon: <CalendarDays size={20} />, label: 'Timetable' },
    { to: '/student/payment', icon: <CreditCard size={20} />, label: 'Student Payment' },
    { to: '/student/attendance', icon: <Check size={20} />, label: 'Attendance' },
    { to: '/student/exam', icon: <FileText size={20} />, label: 'Exam' },
    { to: '/student/event', icon: <Calendar size={20} />, label: 'Event' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon">🎓</div>
        <h2>CampusConnect</h2>
      </div>
      
      <div className="sidebar-user">
        <div className="avatar">{user?.name?.charAt(0)}</div>
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={link.to === `/${user?.role}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="nav-item logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const Navbar = ({ title }) => {
  const { unreadCount, notifications, markAsRead, markAllRead } = useSocket() || { unreadCount: 0, notifications: [] };
  const [showNotifs, setShowNotifs] = React.useState(false);

  return (
    <header className="navbar glass-panel" style={{ position: 'relative' }}>
      <h1 className="page-title">{title}</h1>
      <div className="navbar-actions">
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          
          {showNotifs && (
            <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '50px', right: '0', width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 100, padding: '0', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <h3 style={{ fontSize: '14px' }}>Notifications</h3>
                {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>Mark all read</button>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} onClick={() => !n.read && markAsRead(n._id)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)', display: 'flex', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.read ? 'transparent' : 'var(--accent-primary)', marginTop: '6px', flexShrink: 0 }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.message}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <NavLink to="/profile" className="icon-btn">
          <UserIcon size={20} />
        </NavLink>
      </div>
    </header>
  );
};

export const DashboardLayout = ({ children, title }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

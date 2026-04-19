import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { BookOpen, Search, Plus, Users, Trash2, Edit } from 'lucide-react';
import './Admin.css';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <DashboardLayout title="Course Management">
      <div className="admin-page animate-fade-in">
        <div className="page-actions">
          <div className="search-box glass-panel">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search courses by name or code..." />
          </div>
          <button className="btn btn-primary">
            <Plus size={18} />
            <span>Create Course</span>
          </button>
        </div>

        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Code</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Faculty</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-4">Loading courses...</td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-4">No courses available.</td></tr>
              ) : (
                courses.map(course => (
                  <tr key={course._id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                          <BookOpen size={16} />
                        </div>
                        <div className="font-medium">{course.name}</div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{course.code}</span></td>
                    <td>{course.department}</td>
                    <td>Sem {course.semester}</td>
                    <td>
                      {course.faculty ? (
                        <div className="text-sm">
                          {course.faculty.name}
                        </div>
                      ) : <span className="text-muted text-sm">Not assigned</span>}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-muted" />
                        <span>{course.enrolledStudents?.length || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn-small" title="Edit Course"><Edit size={16} /></button>
                        <button className="icon-btn-small danger" title="Delete Course"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseManagement;

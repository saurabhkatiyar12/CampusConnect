import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import './Admin.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${search}`);
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <DashboardLayout title="User Management">
      <div className="admin-page animate-fade-in">
        <div className="page-actions">
          <div className="search-box glass-panel">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search users by name, email, or roll no..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary">
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>

        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Roll No</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-4">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-4">No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{u.name.charAt(0)}</div>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
                    <td>{u.department || '-'}</td>
                    <td>{u.rollNo || '-'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn-small" title="Edit"><Edit2 size={16} /></button>
                        <button className="icon-btn-small danger" title="Deactivate"><Trash2 size={16} /></button>
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

export default UserManagement;

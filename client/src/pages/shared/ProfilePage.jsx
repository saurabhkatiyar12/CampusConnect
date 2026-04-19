import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { User, Camera, Lock, Mail, Phone, BookOpen, Zap } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    phone: '',
    semester: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        phone: user.phone || '',
        semester: user.semester || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvatarPreview(user.profilePhoto);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('semester', formData.semester);
      if (avatarFile) formDataToSend.append('avatar', avatarFile);

      const res = await api.put('/users/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUser(res.data.data);
        setMessage('Profile updated successfully!');
        setAvatarFile(null);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.put('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setMessage('Password changed successfully!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-header-content">
            <User className="profile-icon" size={32} />
            <div>
              <h1>Profile Settings</h1>
              <p>Manage your account and security preferences</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={18} />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          >
            <Lock size={18} />
            Password
          </button>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {/* Profile Info Tab */}
        {activeTab === 'profile' && (
          <div className="profile-card">
            <form onSubmit={handleProfileUpdate} className="profile-form">
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  <div className="avatar-display">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={user?.name} />
                    ) : (
                      <User size={48} />
                    )}
                  </div>
                  <label className="avatar-upload">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  </label>
                </div>
                <div className="avatar-info">
                  <h3>{user?.name}</h3>
                  <p>{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</p>
                  <p className="text-muted" style={{ marginTop: '4px' }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <hr className="form-divider" />

              {/* Form Fields */}
              <div className="form-grid">
                {/* Name */}
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="form-group">
                  <label>Department</label>
                  <div className="input-wrapper">
                    <BookOpen size={16} className="input-icon" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Semester (Students only) */}
                {user?.role === 'student' && (
                  <div className="form-group">
                    <label>Semester</label>
                    <div className="input-wrapper">
                      <Zap size={16} className="input-icon" />
                      <input
                        type="number"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        min="1"
                        max="8"
                      />
                    </div>
                  </div>
                )}

                {/* Role (Read-only) */}
                <div className="form-group">
                  <label>Role</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      value={user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="profile-card">
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="password-info">
                <Lock size={24} />
                <div>
                  <h3>Change Your Password</h3>
                  <p>Update your password regularly to keep your account secure</p>
                </div>
              </div>

              <hr className="form-divider" />

              <div className="form-group">
                <label>Current Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
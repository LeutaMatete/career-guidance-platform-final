import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

const AdminProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await adminService.getProfile();
      setProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      setError('');

      await adminService.updateProfile(profile);
      setMessage('Profile updated successfully!');
      
      // Update the user context if name changed
      if (user && profile.name !== user.name) {
        // You might want to update the context here
        // This would require adding an updateUser function to your AuthContext
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 6) {
      try {
        setLoading(true);
        await adminService.changePassword(newPassword);
        setMessage('Password changed successfully!');
        alert('Password changed successfully. Please login again.');
        logout();
      } catch (error) {
        console.error('Error changing password:', error);
        setError('Failed to change password: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    } else if (newPassword) {
      setError('Password must be at least 6 characters long');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Profile</h1>
        <p>Manage your account information and settings</p>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-sections">
        {/* Personal Information */}
        <div className="profile-section">
          <h3>Personal Information</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                disabled
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter your address"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="profile-section">
          <h3>Security Settings</h3>
          <div className="security-actions">
            <div className="security-item">
              <h4>Change Password</h4>
              <p>Update your password to keep your account secure</p>
              <button 
                onClick={handlePasswordChange}
                className="btn btn-outline"
                disabled={loading}
              >
                Change Password
              </button>
            </div>

            <div className="security-item">
              <h4>Account Role</h4>
              <p><strong>Role:</strong> Administrator</p>
              <p><strong>Permissions:</strong> Full system access</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="profile-section">
          <h3>System Information</h3>
          <div className="system-info">
            <div className="info-item">
              <strong>User ID:</strong> {user?.id || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="info-item">
              <strong>Last Login:</strong> {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
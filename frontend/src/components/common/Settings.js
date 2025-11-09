import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { adminService } from '../../services/adminService';
import { instituteService } from '../../services/instituteService';
import { companyService } from '../../services/companyService';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  // Security settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    jobAlerts: true,
    courseRecommendations: true,
    newsletter: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDataSharing: true
  });

  useEffect(() => {
    loadUserProfile();
    loadSettings();
  }, []);

  const loadUserProfile = async () => {
    try {
      let profileData = {};
      
      switch (user.role) {
        case 'student':
          profileData = await studentService.getProfile();
          break;
        case 'admin':
          profileData = await adminService.getProfile();
          break;
        case 'institute':
          profileData = await instituteService.getProfile();
          break;
        case 'company':
          profileData = await companyService.getProfile();
          break;
        default:
          profileData = {};
      }

      setProfile({
        name: profileData.name || user.name || '',
        email: profileData.email || user.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile information');
    }
  };

  const loadSettings = async () => {
    // In a real app, you would load these from an API
    // For now, we'll use default values
    const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
    const savedPrivacy = localStorage.getItem(`privacy_${user.id}`);

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }
  };

  const saveSettings = (key, data) => {
    localStorage.setItem(`${key}_${user.id}`, JSON.stringify(data));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let updateResult;
      
      switch (user.role) {
        case 'student':
          updateResult = await studentService.updateProfile(profile);
          break;
        case 'admin':
          updateResult = await adminService.updateProfile(profile);
          break;
        case 'institute':
          updateResult = await instituteService.updateProfile(profile);
          break;
        case 'company':
          updateResult = await companyService.updateProfile(profile);
          break;
        default:
          throw new Error('Unknown user role');
      }

      setSuccess('Profile updated successfully');
      updateUser({ ...user, name: profile.name });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (security.newPassword !== security.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (security.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      let changePasswordResult;
      
      switch (user.role) {
        case 'student':
          changePasswordResult = await studentService.changePassword(security.newPassword);
          break;
        case 'admin':
          changePasswordResult = await adminService.changePassword(security.newPassword);
          break;
        case 'institute':
          changePasswordResult = await instituteService.changePassword(security.newPassword);
          break;
        case 'company':
          changePasswordResult = await companyService.changePassword(security.newPassword);
          break;
        default:
          throw new Error('Unknown user role');
      }

      setSuccess('Password changed successfully');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Logout user after password change for security
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsChange = (key, value) => {
    const updatedNotifications = {
      ...notifications,
      [key]: value
    };
    setNotifications(updatedNotifications);
    saveSettings('notifications', updatedNotifications);
    setSuccess('Notification settings updated');
  };

  const handlePrivacyChange = (key, value) => {
    const updatedPrivacy = {
      ...privacy,
      [key]: value
    };
    setPrivacy(updatedPrivacy);
    saveSettings('privacy', updatedPrivacy);
    setSuccess('Privacy settings updated');
  };

  const handleAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }

    if (!window.confirm('This is your final warning. All your applications, documents, and profile information will be permanently deleted. This cannot be reversed.')) {
      return;
    }

    try {
      setLoading(true);
      // In a real app, you would call an API to delete the account
      // await authService.deleteAccount();
      
      // For now, we'll simulate account deletion
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const getRoleSpecificSettings = () => {
    switch (user.role) {
      case 'student':
        return (
          <div className="settings-section">
            <h3>Student Preferences</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.courseRecommendations}
                  onChange={(e) => handleNotificationsChange('courseRecommendations', e.target.checked)}
                />
                Receive course recommendations
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.jobAlerts}
                  onChange={(e) => handleNotificationsChange('jobAlerts', e.target.checked)}
                />
                Receive job alerts matching my profile
              </label>
            </div>
          </div>
        );
      
      case 'institute':
        return (
          <div className="settings-section">
            <h3>Institute Settings</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.applicationUpdates}
                  onChange={(e) => handleNotificationsChange('applicationUpdates', e.target.checked)}
                />
                Notify about new applications
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.courseRecommendations}
                  onChange={(e) => handleNotificationsChange('courseRecommendations', e.target.checked)}
                />
                Receive system updates and announcements
              </label>
            </div>
          </div>
        );
      
      case 'company':
        return (
          <div className="settings-section">
            <h3>Company Settings</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.applicationUpdates}
                  onChange={(e) => handleNotificationsChange('applicationUpdates', e.target.checked)}
                />
                Notify about new job applications
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.jobAlerts}
                  onChange={(e) => handleNotificationsChange('jobAlerts', e.target.checked)}
                />
                Receive candidate matching alerts
              </label>
            </div>
          </div>
        );
      
      case 'admin':
        return (
          <div className="settings-section">
            <h3>Administrator Settings</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.applicationUpdates}
                  onChange={(e) => handleNotificationsChange('applicationUpdates', e.target.checked)}
                />
                System alerts and notifications
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.newsletter}
                  onChange={(e) => handleNotificationsChange('newsletter', e.target.checked)}
                />
                Platform analytics reports
              </label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and security settings</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="settings-container">
        {/* Settings Navigation */}
        <div className="settings-nav">
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
          <button
            className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-tab">
              <h2>Profile Settings</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    rows="3"
                    placeholder="Enter your address"
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows="4"
                    placeholder="Tell us about yourself..."
                    maxLength="500"
                  />
                  <small>{profile.bio.length}/500 characters</small>
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
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-tab">
              <h2>Security Settings</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                    minLength="6"
                  />
                </div>

                <div className="security-info">
                  <h4>Password Requirements</h4>
                  <ul>
                    <li>At least 6 characters long</li>
                    <li>Should include letters and numbers</li>
                    <li>Avoid using common words or personal information</li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>

              <div className="security-section">
                <h3>Login Security</h3>
                <div className="security-item">
                  <div className="security-info">
                    <strong>Last Login</strong>
                    <span>Recently</span>
                  </div>
                  <button className="btn btn-outline">
                    View Login History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-tab">
              <h2>Notification Settings</h2>
              
              <div className="settings-section">
                <h3>Email Notifications</h3>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => handleNotificationsChange('emailNotifications', e.target.checked)}
                    />
                    Enable email notifications
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Application Notifications</h3>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notifications.applicationUpdates}
                      onChange={(e) => handleNotificationsChange('applicationUpdates', e.target.checked)}
                    />
                    Application status updates
                  </label>
                </div>
              </div>

              {getRoleSpecificSettings()}

              <div className="settings-section">
                <h3>News & Updates</h3>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notifications.newsletter}
                      onChange={(e) => handleNotificationsChange('newsletter', e.target.checked)}
                    />
                    Platform news and announcements
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="settings-tab">
              <h2>Privacy Settings</h2>
              
              <div className="settings-section">
                <h3>Profile Visibility</h3>
                <div className="form-group">
                  <label>
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="public"
                      checked={privacy.profileVisibility === 'public'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    Public - Anyone can see my profile
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="institutions"
                      checked={privacy.profileVisibility === 'institutions'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    Institutions Only - Only educational institutions can see my profile
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="private"
                      checked={privacy.profileVisibility === 'private'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    Private - Only I can see my profile
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Contact Information</h3>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                    />
                    Show my email address to institutions
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacy.showPhone}
                      onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                    />
                    Show my phone number to institutions
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Data Sharing</h3>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacy.allowDataSharing}
                      onChange={(e) => handlePrivacyChange('allowDataSharing', e.target.checked)}
                    />
                    Allow anonymous data sharing for platform improvement
                  </label>
                  <small>Your personal information will never be shared with third parties</small>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="settings-tab">
              <h2>Account Settings</h2>
              
              <div className="settings-section">
                <h3>Account Information</h3>
                <div className="account-info">
                  <div className="info-item">
                    <strong>User ID:</strong>
                    <span>{user.id}</span>
                  </div>
                  <div className="info-item">
                    <strong>Role:</strong>
                    <span>{user.role}</span>
                  </div>
                  <div className="info-item">
                    <strong>Account Created:</strong>
                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Last Login:</strong>
                    <span>Recently</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Danger Zone</h3>
                <div className="danger-zone">
                  <div className="danger-item">
                    <div className="danger-info">
                      <strong>Delete Account</strong>
                      <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <button 
                      className="btn btn-danger"
                      onClick={handleAccountDeletion}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                  
                  <div className="danger-item">
                    <div className="danger-info">
                      <strong>Export Data</strong>
                      <p>Download a copy of all your personal data stored on our platform.</p>
                    </div>
                    <button className="btn btn-outline">
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
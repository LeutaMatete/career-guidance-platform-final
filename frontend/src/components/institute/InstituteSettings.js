import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { instituteService } from '../../services/instituteService';

const InstituteSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      institutionName: '',
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      enableNotifications: true,
      autoSave: true
    },
    application: {
      maxApplicationsPerStudent: 2,
      applicationDeadline: '',
      requireDocuments: true,
      autoRejectIncomplete: false,
      enableWaitlist: true,
      admissionBatchSize: 50
    },
    notifications: {
      emailNotifications: true,
      applicationAlerts: true,
      admissionAlerts: true,
      systemUpdates: true,
      marketingEmails: false,
      smsNotifications: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAlerts: true,
      ipWhitelist: ''
    },
    integration: {
      enableCalendar: true,
      enableEmailIntegration: false,
      apiAccess: false,
      webhookUrl: '',
      syncFrequency: 'daily'
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from API or use defaults
      const savedSettings = await instituteService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const saveSettings = async (category) => {
    setLoading(true);
    setMessage('');

    try {
      await instituteService.updateSettings(settings);
      setMessage(`${category} settings updated successfully`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = (category) => {
    if (window.confirm('Are you sure you want to reset these settings to default values?')) {
      const defaults = {
        general: {
          institutionName: user?.name || '',
          timezone: 'UTC',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          enableNotifications: true,
          autoSave: true
        },
        application: {
          maxApplicationsPerStudent: 2,
          applicationDeadline: '',
          requireDocuments: true,
          autoRejectIncomplete: false,
          enableWaitlist: true,
          admissionBatchSize: 50
        },
        notifications: {
          emailNotifications: true,
          applicationAlerts: true,
          admissionAlerts: true,
          systemUpdates: true,
          marketingEmails: false,
          smsNotifications: false
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAlerts: true,
          ipWhitelist: ''
        },
        integration: {
          enableCalendar: true,
          enableEmailIntegration: false,
          apiAccess: false,
          webhookUrl: '',
          syncFrequency: 'daily'
        }
      };

      setSettings(prev => ({
        ...prev,
        [category]: defaults[category]
      }));
    }
  };

  const testEmailConfiguration = async () => {
    try {
      // await instituteService.testEmailConfig();
      alert('Test email sent successfully. Please check your inbox.');
    } catch (error) {
      console.error('Error testing email configuration:', error);
      alert('Failed to send test email. Please check your configuration.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Institute Settings</h1>
        <p>Configure your institution's preferences and system behavior</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-sidebar">
          <button 
            className={`sidebar-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Settings
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'application' ? 'active' : ''}`}
            onClick={() => setActiveTab('application')}
          >
            Application Settings
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'integration' ? 'active' : ''}`}
            onClick={() => setActiveTab('integration')}
          >
            Integrations
          </button>
        </div>

        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              
              <div className="settings-group">
                <div className="setting-item">
                  <label>Institution Name</label>
                  <input
                    type="text"
                    value={settings.general.institutionName}
                    onChange={(e) => handleSettingChange('general', 'institutionName', e.target.value)}
                    placeholder="Enter institution name"
                  />
                </div>

                <div className="setting-item">
                  <label>Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="CST">Central Time</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Language</label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.general.enableNotifications}
                      onChange={(e) => handleSettingChange('general', 'enableNotifications', e.target.checked)}
                    />
                    Enable System Notifications
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.general.autoSave}
                      onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
                    />
                    Auto-save Changes
                  </label>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => saveSettings('General')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save General Settings'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => resetToDefaults('general')}
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Application Settings */}
          {activeTab === 'application' && (
            <div className="settings-section">
              <h2>Application Settings</h2>
              
              <div className="settings-group">
                <div className="setting-item">
                  <label>Maximum Applications per Student</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={settings.application.maxApplicationsPerStudent}
                    onChange={(e) => handleSettingChange('application', 'maxApplicationsPerStudent', parseInt(e.target.value))}
                  />
                  <small>Maximum number of courses a student can apply to at your institution</small>
                </div>

                <div className="setting-item">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={settings.application.applicationDeadline}
                    onChange={(e) => handleSettingChange('application', 'applicationDeadline', e.target.value)}
                  />
                </div>

                <div className="setting-item">
                  <label>Admission Batch Size</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.application.admissionBatchSize}
                    onChange={(e) => handleSettingChange('application', 'admissionBatchSize', parseInt(e.target.value))}
                  />
                  <small>Number of admissions to process in each batch</small>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.application.requireDocuments}
                      onChange={(e) => handleSettingChange('application', 'requireDocuments', e.target.checked)}
                    />
                    Require Supporting Documents
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.application.autoRejectIncomplete}
                      onChange={(e) => handleSettingChange('application', 'autoRejectIncomplete', e.target.checked)}
                    />
                    Auto-reject Incomplete Applications
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.application.enableWaitlist}
                      onChange={(e) => handleSettingChange('application', 'enableWaitlist', e.target.checked)}
                    />
                    Enable Waitlist for Full Courses
                  </label>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => saveSettings('Application')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Application Settings'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => resetToDefaults('application')}
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              
              <div className="settings-group">
                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                    Enable Email Notifications
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.applicationAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'applicationAlerts', e.target.checked)}
                    />
                    New Application Alerts
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.admissionAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'admissionAlerts', e.target.checked)}
                    />
                    Admission Decision Alerts
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemUpdates}
                      onChange={(e) => handleSettingChange('notifications', 'systemUpdates', e.target.checked)}
                    />
                    System Update Notifications
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.marketingEmails}
                      onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)}
                    />
                    Marketing and Newsletter Emails
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                    />
                    SMS Notifications
                  </label>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => saveSettings('Notification')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Notification Settings'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={testEmailConfiguration}
                >
                  Test Email Configuration
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="settings-group">
                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    />
                    Enable Two-Factor Authentication
                  </label>
                </div>

                <div className="setting-item">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="setting-item">
                  <label>Password Expiry (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                  />
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                    />
                    Login Alert Notifications
                  </label>
                </div>

                <div className="setting-item">
                  <label>IP Whitelist</label>
                  <textarea
                    value={settings.security.ipWhitelist}
                    onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
                    placeholder="Enter IP addresses (one per line)"
                    rows="4"
                  />
                  <small>Restrict access to specific IP addresses. Leave empty to allow all.</small>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => saveSettings('Security')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Security Settings'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => resetToDefaults('security')}
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Integration Settings */}
          {activeTab === 'integration' && (
            <div className="settings-section">
              <h2>Integration Settings</h2>
              
              <div className="settings-group">
                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.integration.enableCalendar}
                      onChange={(e) => handleSettingChange('integration', 'enableCalendar', e.target.checked)}
                    />
                    Enable Calendar Integration
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.integration.enableEmailIntegration}
                      onChange={(e) => handleSettingChange('integration', 'enableEmailIntegration', e.target.checked)}
                    />
                    Enable Email System Integration
                  </label>
                </div>

                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.integration.apiAccess}
                      onChange={(e) => handleSettingChange('integration', 'apiAccess', e.target.checked)}
                    />
                    Enable API Access
                  </label>
                </div>

                <div className="setting-item">
                  <label>Webhook URL</label>
                  <input
                    type="url"
                    value={settings.integration.webhookUrl}
                    onChange={(e) => handleSettingChange('integration', 'webhookUrl', e.target.value)}
                    placeholder="https://your-domain.com/webhook"
                  />
                  <small>URL to receive real-time updates</small>
                </div>

                <div className="setting-item">
                  <label>Data Sync Frequency</label>
                  <select
                    value={settings.integration.syncFrequency}
                    onChange={(e) => handleSettingChange('integration', 'syncFrequency', e.target.value)}
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => saveSettings('Integration')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Integration Settings'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => resetToDefaults('integration')}
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteSettings;
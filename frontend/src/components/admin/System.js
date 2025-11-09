import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const System = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maxApplicationsPerStudent: 2,
    defaultInstitutionApproval: true,
    emailNotifications: true,
    autoPublishAdmissions: false
  });
  const [logs, setLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, logsData, statusData] = await Promise.all([
        adminService.getSystemSettings(),
        adminService.getAuditLogs({ limit: 50 }),
        adminService.runSystemCheck()
      ]);
      setSettings(settingsData);
      setLogs(logsData);
      setSystemStatus(statusData);
    } catch (error) {
      console.error('Error loading system data:', error);
      setMessage('Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      await adminService.updateSystemSettings(settings);
      setMessage('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const runSystemCheck = async () => {
    try {
      const status = await adminService.runSystemCheck();
      setSystemStatus(status);
      setMessage('System check completed');
    } catch (error) {
      console.error('Error running system check:', error);
      setMessage('System check failed');
    }
  };

  const clearCache = async () => {
    if (!window.confirm('Clear system cache? This may temporarily affect performance.')) return;
    try {
      await adminService.clearCache();
      setMessage('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      setMessage('Failed to clear cache');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading system settings...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Management</h1>
        <p>Configure system settings and monitor platform health</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* System Status */}
      <div className="system-status">
        <h2>System Status</h2>
        <div className="status-grid">
          <div className="status-card">
            <h3>Database</h3>
            <p className={`status ${systemStatus.database?.status === 'healthy' ? 'healthy' : 'warning'}`}>
              {systemStatus.database?.status || 'Unknown'}
            </p>
          </div>
          <div className="status-card">
            <h3>API</h3>
            <p className={`status ${systemStatus.api?.status === 'healthy' ? 'healthy' : 'warning'}`}>
              {systemStatus.api?.status || 'Unknown'}
            </p>
          </div>
          <div className="status-card">
            <h3>Firebase</h3>
            <p className={`status ${systemStatus.firebase?.status === 'connected' ? 'healthy' : 'error'}`}>
              {systemStatus.firebase?.status || 'Unknown'}
            </p>
          </div>
          <div className="status-card">
            <h3>Uptime</h3>
            <p className="status healthy">{systemStatus.uptime || '99.9%'}</p>
          </div>
        </div>
        <div className="status-actions">
          <button className="btn btn-primary" onClick={runSystemCheck}>
            Run System Check
          </button>
          <button className="btn btn-secondary" onClick={clearCache}>
            Clear Cache
          </button>
        </div>
      </div>

      {/* System Settings */}
      <div className="system-settings">
        <h2>System Settings</h2>
        <form className="settings-form">
          <div className="setting-row">
            <label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
              />
              Maintenance Mode (blocks user access)
            </label>
          </div>
          <div className="setting-row">
            <label>
              Max Applications per Student:
              <input
                type="number"
                min="1"
                max="5"
                value={settings.maxApplicationsPerStudent}
                onChange={(e) => handleSettingChange('maxApplicationsPerStudent', parseInt(e.target.value))}
              />
            </label>
          </div>
          <div className="setting-row">
            <label>
              <input
                type="checkbox"
                checked={settings.defaultInstitutionApproval}
                onChange={(e) => handleSettingChange('defaultInstitutionApproval', e.target.checked)}
              />
              Auto-approve new institutions
            </label>
          </div>
          <div className="setting-row">
            <label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
              Enable system email notifications
            </label>
          </div>
          <div className="setting-row">
            <label>
              <input
                type="checkbox"
                checked={settings.autoPublishAdmissions}
                onChange={(e) => handleSettingChange('autoPublishAdmissions', e.target.checked)}
              />
              Auto-publish admissions weekly
            </label>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Audit Logs */}
      <div className="audit-logs">
        <h2>Audit Logs</h2>
        <div className="logs-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No logs found</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.user?.name || log.userId}</td>
                    <td>{log.action}</td>
                    <td>{log.details ? JSON.stringify(log.details) : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default System;
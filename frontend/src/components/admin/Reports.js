import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const Reports = () => {
  const [userReports, setUserReports] = useState({});
  const [appReports, setAppReports] = useState({});
  const [systemReports, setSystemReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [dateRange, setDateRange] = useState('30days');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      const [userRes, appRes, sysRes] = await Promise.all([
        adminService.getUserReports(),
        adminService.getApplicationReports(),
        adminService.getSystemReports()
      ]);
      setUserReports(userRes);
      setAppReports(appRes);
      setSystemReports(sysRes);
    } catch (error) {
      console.error('Error loading reports:', error);
      setMessage('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const blob = await adminService.exportReport(format, dateRange);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${dateRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
      setMessage('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Reports</h1>
        <p>Comprehensive analytics and system insights</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Controls */}
      <div className="reports-controls">
        <div className="range-selector">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="export-buttons">
          <button className="btn btn-outline" onClick={() => exportReport('csv')}>
            Export CSV
          </button>
          <button className="btn btn-outline" onClick={() => exportReport('pdf')}>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Statistics
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Application Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System Overview
        </button>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {activeTab === 'users' && (
          <div className="report-section">
            <h2>User Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{userReports.totalUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Students</h3>
                <p className="stat-value">{userReports.students || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Institutions</h3>
                <p className="stat-value">{userReports.institutions || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Companies</h3>
                <p className="stat-value">{userReports.companies || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Approvals</h3>
                <p className="stat-value">{userReports.pendingApprovals || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="report-section">
            <h2>Application Analytics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Applications</h3>
                <p className="stat-value">{appReports.totalApplications || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-value">{appReports.pending || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Admitted</h3>
                <p className="stat-value">{appReports.admitted || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Rejected</h3>
                <p className="stat-value">{appReports.rejected || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Average Processing Time</h3>
                <p className="stat-value">{appReports.avgProcessingTime || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="report-section">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Active Institutions</h3>
                <p className="stat-value">{systemReports.activeInstitutions || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Active Companies</h3>
                <p className="stat-value">{systemReports.activeCompanies || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Courses</h3>
                <p className="stat-value">{systemReports.totalCourses || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Job Postings</h3>
                <p className="stat-value">{systemReports.jobPostings || 0}</p>
              </div>
              <div className="stat-card">
                <h3>System Uptime</h3>
                <p className="stat-value">{systemReports.uptime || '99.9%'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
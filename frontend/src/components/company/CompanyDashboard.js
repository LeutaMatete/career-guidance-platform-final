import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [companyStatus, setCompanyStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    checkCompanyStatus();
  }, []);

  const checkCompanyStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const statusData = await companyService.getStatus();
      setCompanyStatus(statusData.status);
      
      if (statusData.status === 'active') {
        loadAnalytics();
      }
    } catch (error) {
      console.error('Error checking company status:', error);
      setError('Failed to load company status');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await companyService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading company dashboard...</div>
        </div>
      </div>
    );
  }

  if (companyStatus !== 'active') {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Company Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <div className="status-message">
          <div className="alert alert-warning">
            <h3>Account Status: {companyStatus.toUpperCase()}</h3>
            <p>Your company account is currently {companyStatus}.</p>
            <p>{companyStatus === 'suspended' ? 
              'Please contact the platform administrator to reactivate your account.' :
              'Your account is pending approval by an administrator.'}
            </p>
            <p>You will be able to post jobs and manage applications once your account is active.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Company Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      {/* Analytics Overview */}
      {analytics && (
        <div className="analytics-overview">
          <h3>Company Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <h4>Active Jobs</h4>
                <p className="stat-number">{analytics.activeJobs}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <h4>Total Applications</h4>
                <p className="stat-number">{analytics.totalApplications}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <h4>Pending Review</h4>
                <p className="stat-number">{analytics.pendingApplications}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <h4>Hired Candidates</h4>
                <p className="stat-number">{analytics.hiredCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/company/jobs/post'}
          >
            Post New Job
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => window.location.href = '/company/jobs'}
          >
            Manage Jobs
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => window.location.href = '/company/applicants'}
          >
            View Applicants
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => window.location.href = '/company/analytics'}
          >
            View Analytics
          </button>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <p>Your company dashboard is ready. Start by posting your first job opening.</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
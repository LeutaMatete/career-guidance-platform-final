import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { instituteService } from '../../services/instituteService';

const InstituteDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    faculties: 0,
    courses: 0,
    applications: 0,
    pendingApplications: 0,
    admissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [faculties, courses, applications] = await Promise.all([
        instituteService.getFaculties(),
        instituteService.getCourses(),
        instituteService.getApplications()
      ]);

      const pendingApps = applications.filter(app => app.status === 'pending');
      const admissions = applications.filter(app => app.status === 'admitted');

      setStats({
        faculties: faculties.length,
        courses: courses.length,
        applications: applications.length,
        pendingApplications: pendingApps.length,
        admissions: admissions.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading institution dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Institution Dashboard</h1>
        <p>Welcome, {user?.name}. Manage your educational programs and student applications.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Faculties</h3>
          <p className="stat-number">{stats.faculties}</p>
          <p className="stat-label">Academic Departments</p>
        </div>

        <div className="stat-card">
          <h3>Courses</h3>
          <p className="stat-number">{stats.courses}</p>
          <p className="stat-label">Active Programs</p>
        </div>

        <div className="stat-card">
          <h3>Applications</h3>
          <p className="stat-number">{stats.applications}</p>
          <p className="stat-label">Total Received</p>
        </div>

        <div className="stat-card">
          <h3>Pending Review</h3>
          <p className="stat-number">{stats.pendingApplications}</p>
          <p className="stat-label">Awaiting Decision</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <a href="/institute/faculties" className="action-card">
              <h3>Manage Faculties</h3>
              <p>Create and organize academic departments and faculties</p>
            </a>
            
            <a href="/institute/courses" className="action-card">
              <h3>Manage Courses</h3>
              <p>Add new courses and programs for student applications</p>
            </a>
            
            <a href="/institute/applications" className="action-card">
              <h3>View Applications</h3>
              <p>Review and process student applications</p>
            </a>
            
            <a href="/institute/admissions" className="action-card">
              <h3>Publish Admissions</h3>
              <p>Release admission results to students</p>
            </a>
            
            <a href="/institute/profile" className="action-card">
              <h3>Institution Profile</h3>
              <p>Update your institution information and settings</p>
            </a>
            
            <a href="/institute/analytics" className="action-card">
              <h3>View Analytics</h3>
              <p>See application statistics and reports</p>
            </a>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;
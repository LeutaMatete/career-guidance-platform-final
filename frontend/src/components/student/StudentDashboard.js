import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    admissions: 0,
    jobsApplied: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const [applications, jobApplications, admissions] = await Promise.all([
        studentService.getMyApplications(),
        studentService.getMyJobApplications(),
        studentService.getAdmissionResults()
      ]);

      setStats({
        applications: applications.length,
        admissions: admissions.filter(admission => admission.status === 'admitted').length,
        jobsApplied: jobApplications.length
      });

      const activity = [
        ...applications.map(app => ({
          type: 'application',
          message: `Applied to ${app.courseName}`,
          date: app.appliedAt,
          status: app.status
        })),
        ...admissions.map(adm => ({
          type: 'admission',
          message: `Admission result for ${adm.courseName}: ${adm.status}`,
          date: adm.admittedAt || adm.updatedAt,
          status: adm.status
        })),
        ...jobApplications.map(jobApp => ({
          type: 'job_application',
          message: `Applied to ${jobApp.jobTitle} at ${jobApp.companyName}`,
          date: jobApp.appliedAt,
          status: jobApp.status
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Course Applications</h3>
          <p className="stat-number">{stats.applications}</p>
          <Link to="/student/applications" className="btn btn-outline">View Applications</Link>
        </div>

        <div className="stat-card">
          <h3>Admissions</h3>
          <p className="stat-number">{stats.admissions}</p>
          <Link to="/student/admissions" className="btn btn-outline">Check Results</Link>
        </div>

        <div className="stat-card">
          <h3>Jobs Applied</h3>
          <p className="stat-number">{stats.jobsApplied}</p>
          <Link to="/student/jobs" className="btn btn-outline">Browse Jobs</Link>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <p className="no-activity">No recent activity</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'application' && ''}
                  {activity.type === 'admission' && ''}
                  {activity.type === 'job_application' && ''}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <p className="activity-date">
                    {new Date(activity.date).toLocaleDateString()} • 
                    <span className={`status-${activity.status}`}>{activity.status}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const PublishAdmissions = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingDecisions: 0,
    admittedStudents: 0,
    rejectedApplications: 0
  });

  useEffect(() => {
    loadAdmissionStats();
  }, []);

  const loadAdmissionStats = async () => {
    try {
      const applicationReports = await adminService.getApplicationReports();
      setStats({
        totalApplications: applicationReports.totalApplications || 0,
        pendingDecisions: applicationReports.pending || 0,
        admittedStudents: applicationReports.approved || 0,
        rejectedApplications: applicationReports.rejected || 0
      });
    } catch (error) {
      console.error('Error loading admission stats:', error);
    }
  };

  const handlePublishAdmissions = async () => {
    if (window.confirm(
      `Are you sure you want to publish admissions?\n\n` +
      `This will notify ${stats.admittedStudents} admitted students and make results public.\n` +
      `This action cannot be undone.`
    )) {
      try {
        setLoading(true);
        setMessage('');
        
        // Pass empty array to let backend handle the logic
        const result = await adminService.publishAdmissions([]);
        
        setMessage(result.message || 'Admissions published successfully!');
        
        // Reload stats to reflect changes
        await loadAdmissionStats();
        
      } catch (error) {
        console.error('Error publishing admissions:', error);
        setMessage('Failed to publish admissions: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviewAdmissions = async () => {
    try {
      setLoading(true);
      // This would typically fetch and display a preview of admission results
      setMessage('Preview feature coming soon. Currently showing statistics only.');
    } catch (error) {
      console.error('Error previewing admissions:', error);
      setMessage('Failed to preview admissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Publish Admissions</h1>
        <p>Publish admission results and notify students</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error-message' : 'success-message'}`}>
          {message}
        </div>
      )}

      <div className="publish-section">
        <div className="warning-banner">
          <h3>Important Notice</h3>
          <p>
            Publishing admissions will make the admission results visible to all students and send notifications. 
            This action is irreversible. Please ensure all admission decisions are finalized before proceeding.
          </p>
        </div>

        <div className="admission-stats">
          <h3>Admission Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Applications</h4>
              <p className="stat-number">{stats.totalApplications}</p>
            </div>
            <div className="stat-card">
              <h4>Pending Decisions</h4>
              <p className="stat-number">{stats.pendingDecisions}</p>
            </div>
            <div className="stat-card">
              <h4>Admitted Students</h4>
              <p className="stat-number">{stats.admittedStudents}</p>
            </div>
            <div className="stat-card">
              <h4>Rejected Applications</h4>
              <p className="stat-number">{stats.rejectedApplications}</p>
            </div>
          </div>
        </div>

        <div className="publish-actions">
          <button 
            onClick={handlePublishAdmissions}
            disabled={loading || stats.admittedStudents === 0}
            className="btn btn-primary"
          >
            {loading ? 'Publishing...' : `Publish Admissions (${stats.admittedStudents})`}
          </button>
          
          <button 
            onClick={handlePreviewAdmissions}
            disabled={loading}
            className="btn btn-outline"
          >
            Preview Admission Results
          </button>
        </div>

        {stats.admittedStudents === 0 && (
          <div className="info-message">
            <p>There are no admitted students to publish. Please ensure applications have been approved first.</p>
          </div>
        )}

        <div className="instructions">
          <h4>How it works:</h4>
          <ol>
            <li>Institutions review and approve/reject applications</li>
            <li>Approved applications become "admitted students"</li>
            <li>Click "Publish Admissions" to make results public</li>
            <li>Students will be notified and can view their results</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PublishAdmissions;
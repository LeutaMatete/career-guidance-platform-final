import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const applicationsData = await studentService.getMyApplications();
      
      // Sort applications by application date (newest first)
      const sortedApplications = applicationsData.sort((a, b) => {
        const dateA = new Date(a.appliedAt?.toDate?.() || a.appliedAt);
        const dateB = new Date(b.appliedAt?.toDate?.() || b.appliedAt);
        return dateB - dateA;
      });
      
      setApplications(sortedApplications);
      setError('');
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(application => {
    if (filter === 'all') return true;
    return application.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'admitted':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      case 'pending':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'admitted':
        return '';
      case 'rejected':
        return '';
      case 'pending':
        return '';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
      case 'admitted':
        return 'Application Approved';
      case 'rejected':
        return 'Application Rejected';
      case 'pending':
        return 'Under Review';
      default:
        return 'Status Unknown';
    }
  };

  const getDaysSinceApplied = (appliedDate) => {
    const applied = new Date(appliedDate?.toDate?.() || appliedDate);
    const now = new Date();
    const diffTime = Math.abs(now - applied);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      setWithdrawing(true);
      // Note: You'll need to add a withdrawApplication function to your studentService
      // For now, we'll just simulate the action
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      setError('');
      
      // If you implement backend withdrawal, uncomment this:
      // await studentService.withdrawApplication(applicationId);
      // await loadApplications(); // Reload to reflect changes
      
    } catch (error) {
      console.error('Error withdrawing application:', error);
      setError('Failed to withdraw application');
    } finally {
      setWithdrawing(false);
      setSelectedApplication(null);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'admitted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const getApplicationProgress = (application) => {
    const daysSinceApplied = getDaysSinceApplied(application.appliedAt);
    
    if (application.status === 'approved' || application.status === 'admitted') {
      return { stage: 'Completed', percentage: 100, color: '#28a745' };
    } else if (application.status === 'rejected') {
      return { stage: 'Not Successful', percentage: 100, color: '#dc3545' };
    } else {
      // Simulate progress based on days since application
      let percentage = Math.min(30 + (daysSinceApplied * 5), 90);
      let stage = 'Under Review';
      
      if (daysSinceApplied > 14) stage = 'Final Review';
      else if (daysSinceApplied > 7) stage = 'Department Review';
      else stage = 'Initial Screening';
      
      return { stage, percentage, color: '#ffc107' };
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Loading your applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track and manage your course applications</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Application Statistics */}
      <div className="applications-stats-overview">
        <h3>Application Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            
            <div className="stat-content">
              <h4>Total Applications</h4>
              <p className="stat-number">{applicationStats.total}</p>
            </div>
          </div>
          <div className="stat-card pending">
            
            <div className="stat-content">
              <h4>Under Review</h4>
              <p className="stat-number">{applicationStats.pending}</p>
            </div>
          </div>
          <div className="stat-card approved">
            
            <div className="stat-content">
              <h4>Approved</h4>
              <p className="stat-number">{applicationStats.approved}</p>
            </div>
          </div>
          <div className="stat-card rejected">
            
            <div className="stat-content">
              <h4>Rejected</h4>
              <p className="stat-number">{applicationStats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {applications.length > 0 && (
        <div className="filter-tabs">
          <button 
            className={`tab-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({applicationStats.total})
          </button>
          <button 
            className={`tab-button ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Under Review ({applicationStats.pending})
          </button>
          <button 
            className={`tab-button ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({applicationStats.approved})
          </button>
          <button 
            className={`tab-button ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applicationStats.rejected})
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="applications-container">
        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            {applications.length === 0 ? (
              <>
               
                <h3>No Applications Yet</h3>
                <p>You haven't submitted any course applications yet.</p>
                <p>Start by browsing available courses and institutions.</p>
                <div className="empty-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/student/courses'}
                  >
                    Browse Courses
                  </button>
                </div>
              </>
            ) : (
              <>
               
                <h3>No {filter} applications</h3>
                <p>You don't have any {filter} applications at the moment.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setFilter('all')}
                >
                  View All Applications
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map((application) => {
              const progress = getApplicationProgress(application);
              const daysSinceApplied = getDaysSinceApplied(application.appliedAt);
              
              return (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <div className="application-basic-info">
                      <h3>{application.courseName}</h3>
                      <p className="institution-name">{application.institutionName}</p>
                    </div>
                    <div className="application-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(application.status) }}
                      >
                        {getStatusIcon(application.status)} {application.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="application-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Applied Date:</strong>
                        <span>{new Date(application.appliedAt?.toDate?.() || application.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Days Since Applied:</strong>
                        <span>{daysSinceApplied} days</span>
                      </div>
                      <div className="detail-item">
                        <strong>Last Updated:</strong>
                        <span>{new Date(application.updatedAt?.toDate?.() || application.updatedAt || application.appliedAt?.toDate?.() || application.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Pending Applications */}
                  {application.status === 'pending' && (
                    <div className="application-progress">
                      <div className="progress-info">
                        <span className="progress-stage">{progress.stage}</span>
                        <span className="progress-percentage">{progress.percentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${progress.percentage}%`,
                            backgroundColor: progress.color
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="application-actions">
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleViewDetails(application)}
                    >
                      View Details
                    </button>
                    
                    {application.status === 'pending' && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleWithdrawApplication(application.id)}
                        disabled={withdrawing}
                      >
                        {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}
                    
                    {(application.status === 'approved' || application.status === 'admitted') && (
                      <button className="btn btn-success">
                        View Admission Letter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedApplication(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Course Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Course:</strong>
                    <span>{selectedApplication.courseName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Institution:</strong>
                    <span>{selectedApplication.institutionName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Application ID:</strong>
                    <span>{selectedApplication.id}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Application Timeline</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Applied Date:</strong>
                    <span>{new Date(selectedApplication.appliedAt?.toDate?.() || selectedApplication.appliedAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Updated:</strong>
                    <span>{new Date(selectedApplication.updatedAt?.toDate?.() || selectedApplication.updatedAt || selectedApplication.appliedAt?.toDate?.() || selectedApplication.appliedAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Current Status:</strong>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedApplication.status) }}
                    >
                      {selectedApplication.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Next Steps</h3>
                {selectedApplication.status === 'pending' && (
                  <ul className="next-steps-list">
                    <li>Application received and under review</li>
                    <li>Department evaluation in progress</li>
                    <li>Decision expected within 2-4 weeks</li>
                    <li>You will be notified via email</li>
                  </ul>
                )}
                {selectedApplication.status === 'approved' && (
                  <ul className="next-steps-list">
                    <li>Congratulations! Your application has been approved</li>
                    <li>Check your email for official admission letter</li>
                    <li>Review acceptance deadline</li>
                    <li>Prepare required documents for enrollment</li>
                  </ul>
                )}
                {selectedApplication.status === 'rejected' && (
                  <ul className="next-steps-list">
                    <li>You may receive feedback via email</li>
                    <li>Consider applying to other courses</li>
                    <li>Contact admissions office for more information</li>
                    <li>Improve your qualifications for future applications</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
              {selectedApplication.status === 'pending' && (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleWithdrawApplication(selectedApplication.id)}
                  disabled={withdrawing}
                >
                  {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
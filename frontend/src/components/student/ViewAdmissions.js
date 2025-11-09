import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';

const ViewAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, admitted, waitlisted, rejected

  useEffect(() => {
    loadAdmissions();
  }, []);

  const loadAdmissions = async () => {
    try {
      setLoading(true);
      const admissionsData = await studentService.getAdmissionResults();
      
      // Sort admissions by decision date (newest first)
      const sortedAdmissions = admissionsData.sort((a, b) => {
        const dateA = new Date(a.admittedAt?.toDate?.() || a.admittedAt || a.appliedAt?.toDate?.() || a.appliedAt);
        const dateB = new Date(b.admittedAt?.toDate?.() || b.admittedAt || b.appliedAt?.toDate?.() || b.appliedAt);
        return dateB - dateA;
      });
      
      setAdmissions(sortedAdmissions);
      setError('');
    } catch (error) {
      console.error('Error loading admissions:', error);
      setError('Failed to load admission results');
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    if (filter === 'all') return true;
    return admission.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      case 'waitlisted':
        return '#ffc107';
      case 'pending':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'admitted':
        return '';
      case 'rejected':
        return '';
      case 'waitlisted':
        return '';
      case 'pending':
        return '';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'admitted':
        return 'Congratulations! You have been admitted';
      case 'rejected':
        return 'Application not successful';
      case 'waitlisted':
        return 'You are on the waiting list';
      case 'pending':
        return 'Decision pending';
      default:
        return 'Status unknown';
    }
  };

  const getActionButtons = (admission) => {
    switch (admission.status) {
      case 'admitted':
        return (
          <div className="action-buttons">
            <button className="btn btn-success">
              Accept Offer
            </button>
            <button className="btn btn-outline">
              Request More Info
            </button>
          </div>
        );
      case 'waitlisted':
        return (
          <div className="action-buttons">
            <button className="btn btn-outline">
              Stay on Waitlist
            </button>
            <button className="btn btn-secondary">
              Withdraw
            </button>
          </div>
        );
      case 'rejected':
        return (
          <div className="action-buttons">
            <button className="btn btn-outline">
              Appeal Decision
            </button>
            <button className="btn btn-secondary">
              Apply to Other Courses
            </button>
          </div>
        );
      default:
        return (
          <div className="action-buttons">
            <button className="btn btn-outline" disabled>
              Decision Pending
            </button>
          </div>
        );
    }
  };

  const admissionStats = {
    total: admissions.length,
    admitted: admissions.filter(a => a.status === 'admitted').length,
    waitlisted: admissions.filter(a => a.status === 'waitlisted').length,
    rejected: admissions.filter(a => a.status === 'rejected').length,
    pending: admissions.filter(a => a.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Loading admission results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admission Results</h1>
        <p>View your course application decisions and next steps</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics Overview */}
      {admissions.length > 0 && (
        <div className="admission-stats-overview">
          <h3>Application Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
             
              <div className="stat-content">
                <h4>Total Applications</h4>
                <p className="stat-number">{admissionStats.total}</p>
              </div>
            </div>
            <div className="stat-card admitted">
              <div className="stat-icon">🎓</div>
              <div className="stat-content">
                <h4>Admitted</h4>
                <p className="stat-number">{admissionStats.admitted}</p>
              </div>
            </div>
            <div className="stat-card waitlisted">
          
              <div className="stat-content">
                <h4>Waitlisted</h4>
                <p className="stat-number">{admissionStats.waitlisted}</p>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-content">
                <h4>Rejected</h4>
                <p className="stat-number">{admissionStats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {admissions.length > 0 && (
        <div className="filter-tabs">
          <button 
            className={`tab-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({admissionStats.total})
          </button>
          <button 
            className={`tab-button ${filter === 'admitted' ? 'active' : ''}`}
            onClick={() => setFilter('admitted')}
          >
            Admitted ({admissionStats.admitted})
          </button>
          <button 
            className={`tab-button ${filter === 'waitlisted' ? 'active' : ''}`}
            onClick={() => setFilter('waitlisted')}
          >
            Waitlisted ({admissionStats.waitlisted})
          </button>
          <button 
            className={`tab-button ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({admissionStats.rejected})
          </button>
        </div>
      )}

      {/* Admissions List */}
      <div className="admissions-container">
        {filteredAdmissions.length === 0 ? (
          <div className="empty-state">
            {admissions.length === 0 ? (
              <>
                <h3>No Admission Results Yet</h3>
                <p>Your admission results will appear here once they are published by the institutions.</p>
                <p>Check back later or contact the institutions directly for updates.</p>
                <div className="empty-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={loadAdmissions}
                  >
                    Refresh Results
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>No {filter} applications</h3>
                <p>You don't have any {filter} admission results at the moment.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setFilter('all')}
                >
                  View All Results
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="admissions-list">
            {filteredAdmissions.map((admission, index) => (
              <div key={admission.id || index} className={`admission-card status-${admission.status}`}>
                <div className="admission-header">
                  <div className="admission-title">
                    <span className="status-icon">{getStatusIcon(admission.status)}</span>
                    <h3>{admission.courseName}</h3>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(admission.status) }}
                  >
                    {admission.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="admission-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <strong>Institution:</strong>
                      <span>{admission.institutionName}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Decision Date:</strong>
                      <span>
                        {admission.admittedAt ? 
                          new Date(admission.admittedAt?.toDate?.() || admission.admittedAt).toLocaleDateString() : 
                          'Pending'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="status-message">
                    {getStatusText(admission.status)}
                  </div>
                </div>

                {/* Status-specific content */}
                {admission.status === 'admitted' && (
                  <div className="admission-success">
                    <div className="success-header">
                      <h4>Congratulations on Your Admission!</h4>
                    </div>
                    <div className="success-content">
                      <p>
                        You have been admitted to <strong>{admission.courseName}</strong> at{' '}
                        <strong>{admission.institutionName}</strong>. This is a significant achievement!
                      </p>
                      <div className="next-steps">
                        <h5>Next Steps:</h5>
                        <ul>
                          <li>Check your email for the official admission letter</li>
                          <li>Review the acceptance deadline (typically 2-4 weeks)</li>
                          <li>Contact the institution for enrollment procedures</li>
                          <li>Prepare required documents for registration</li>
                          <li>Inquire about tuition fees and payment schedules</li>
                          <li>Explore accommodation options if needed</li>
                        </ul>
                      </div>
                    </div>
                    {getActionButtons(admission)}
                  </div>
                )}

                {admission.status === 'rejected' && (
                  <div className="admission-rejection">
                    <div className="rejection-header">
                      <h4>Application Decision</h4>
                    </div>
                    <div className="rejection-content">
                      <p>
                        We appreciate your interest in <strong>{admission.courseName}</strong> at{' '}
                        <strong>{admission.institutionName}</strong>. While your application was competitive, 
                        we are unable to offer you admission at this time.
                      </p>
                      <div className="suggestions">
                        <h5>What You Can Do:</h5>
                        <ul>
                          <li>Consider applying to other courses or institutions</li>
                          <li>Improve your qualifications and reapply next intake</li>
                          <li>Explore alternative educational pathways</li>
                          <li>Contact admissions office for feedback (if available)</li>
                        </ul>
                      </div>
                    </div>
                    {getActionButtons(admission)}
                  </div>
                )}

                {admission.status === 'waitlisted' && (
                  <div className="admission-waitlist">
                    <div className="waitlist-header">
                      <h4>Waitlist Status</h4>
                    </div>
                    <div className="waitlist-content">
                      <p>
                        Your application for <strong>{admission.courseName}</strong> at{' '}
                        <strong>{admission.institutionName}</strong> has been placed on our waiting list.
                      </p>
                      <div className="waitlist-info">
                        <h5>About the Waitlist:</h5>
                        <ul>
                          <li>You are among qualified candidates waiting for available spots</li>
                          <li>Positions may become available if admitted students decline</li>
                          <li>Final decisions are typically made before the semester starts</li>
                          <li>Ensure your contact information is up to date</li>
                        </ul>
                      </div>
                    </div>
                    {getActionButtons(admission)}
                  </div>
                )}

                {admission.status === 'pending' && (
                  <div className="admission-pending">
                    <div className="pending-header">
                      <h4>Application Under Review</h4>
                    </div>
                    <div className="pending-content">
                      <p>
                        Your application for <strong>{admission.courseName}</strong> at{' '}
                        <strong>{admission.institutionName}</strong> is currently under review.
                      </p>
                      <div className="pending-info">
                        <h5>What to Expect:</h5>
                        <ul>
                          <li>Decision typically takes 2-6 weeks</li>
                          <li>You will be notified via email when a decision is made</li>
                          <li>Ensure all required documents are submitted</li>
                          <li>📞 Contact admissions office for timeline updates</li>
                        </ul>
                      </div>
                    </div>
                    {getActionButtons(admission)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      {admissions.length > 0 && (
        <div className="help-section">
          <h3>Need Help?</h3>
          <div className="help-options">
            <div className="help-card">
              <h4>Contact Institutions</h4>
              <p>Reach out directly to institution admissions offices for specific questions about your application.</p>
            </div>
            <div className="help-card">
              <h4>Check Email</h4>
              <p>Official communication and detailed information are often sent via email. Check your spam folder too.</p>
            </div>
            <div className="help-card">
              <h4>Multiple Offers</h4>
              <p>If you receive multiple admission offers, carefully compare programs before making your decision.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAdmissions;
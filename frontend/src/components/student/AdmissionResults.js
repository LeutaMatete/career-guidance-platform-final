import React, { useState, useEffect } from 'react';
import { studentInstituteService } from '../../services/studentInstituteService';

const AdmissionResults = () => {
  const [admissionResults, setAdmissionResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadAdmissionResults();
    loadNotifications();
  }, []);

  const loadAdmissionResults = async () => {
    try {
      const results = await studentInstituteService.getAdmissionResults();
      setAdmissionResults(results);
    } catch (error) {
      console.error('Error loading admission results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await studentInstituteService.getNotifications();
      setNotifications(notifs.filter(n => n.type === 'admission'));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleAcceptAdmission = async (admissionId) => {
    try {
      // API call to accept admission offer
      alert('Admission accepted successfully!');
      loadAdmissionResults();
    } catch (error) {
      console.error('Error accepting admission:', error);
      alert('Failed to accept admission. Please try again.');
    }
  };

  const handleDeclineAdmission = async (admissionId) => {
    try {
      // API call to decline admission offer
      alert('Admission declined.');
      loadAdmissionResults();
    } catch (error) {
      console.error('Error declining admission:', error);
      alert('Failed to decline admission. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading admission results...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admission Results</h1>
        <p>View your admission decisions from institutions</p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-section">
          <h2>Recent Notifications</h2>
          {notifications.map(notification => (
            <div key={notification.id} className="notification-card">
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => studentInstituteService.markNotificationRead(notification.id)}
              >
                Mark Read
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Admission Results */}
      <div className="admission-results-section">
        <h2>Your Admission Decisions</h2>
        
        {admissionResults.length === 0 ? (
          <div className="empty-state">
            <p>No admission results available yet. Check back later for updates.</p>
          </div>
        ) : (
          <div className="admission-results-list">
            {admissionResults.map(result => (
              <div key={result.id} className={`admission-card status-${result.status}`}>
                <div className="admission-header">
                  <h3>{result.courseName}</h3>
                  <span className={`status-badge ${result.status}`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </span>
                </div>
                
                <div className="admission-details">
                  <p><strong>Institution:</strong> {result.institutionName}</p>
                  <p><strong>Decision Date:</strong> {new Date(result.decisionDate).toLocaleDateString()}</p>
                  
                  {result.status === 'admitted' && (
                    <div className="admission-offer">
                      <h4>Admission Offer</h4>
                      <p>Congratulations! You have been admitted to this program.</p>
                      <p><strong>Acceptance Deadline:</strong> {new Date(result.acceptanceDeadline).toLocaleDateString()}</p>
                      
                      <div className="offer-actions">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleAcceptAdmission(result.id)}
                        >
                          Accept Offer
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeclineAdmission(result.id)}
                        >
                          Decline Offer
                        </button>
                      </div>
                    </div>
                  )}

                  {result.status === 'rejected' && (
                    <div className="rejection-notice">
                      <p>We regret to inform you that your application was not successful.</p>
                      {result.feedback && (
                        <div className="feedback">
                          <strong>Feedback:</strong> {result.feedback}
                        </div>
                      )}
                    </div>
                  )}

                  {result.status === 'waitlisted' && (
                    <div className="waitlist-notice">
                      <p>Your application has been placed on a waitlist.</p>
                      <p>We will notify you if a spot becomes available.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionResults;
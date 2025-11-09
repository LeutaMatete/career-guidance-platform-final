import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

const ViewApplicants = () => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({}); // Track update status per applicant
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setError('');
      const applicantsData = await companyService.getApplicants();
      // Sort applicants by application date (newest first)
      const sortedApplicants = applicantsData.sort((a, b) => new Date(b.appliedAt?.toDate?.() || b.appliedAt) - new Date(a.appliedAt?.toDate?.() || a.appliedAt));
      setApplicants(sortedApplicants);
    } catch (error) {
      console.error('Error loading applicants:', error);
      setError('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdating(prev => ({ ...prev, [applicationId]: true }));
    setError('');
    setSuccess('');

    try {
      // Assuming you have a service method to update applicant status
      // await companyService.updateApplicantStatus(applicationId, newStatus);
      // For now, let's simulate the update by updating the local state
      setApplicants(prevApplicants =>
        prevApplicants.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      setSuccess(`Applicant status updated to ${newStatus}`);
    } catch (error) {
      setError(error.message || 'Failed to update applicant status');
    } finally {
      setUpdating(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Loading applicants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>View Applicants</h1>
        <p>Review and manage job applicants.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {applicants.length === 0 ? (
        <div className="empty-state">
          <p>No applicants found for your jobs.</p>
        </div>
      ) : (
        <div className="applicants-grid">
          {applicants.map(applicant => (
            <div key={applicant.id} className="applicant-card">
              <div className="applicant-info">
                <h3>{applicant.studentName}</h3>
                <p className="applicant-email">{applicant.studentEmail}</p>
                <p className="application-date">
                  Applied: {new Date(applicant.appliedAt?.toDate?.() || applicant.appliedAt).toLocaleDateString()}
                </p>
                <p className="application-job-id">Job ID: {applicant.jobId}</p>
              </div>
              <div className="applicant-actions">
                <div className="status-badge status-{applicant.status.toLowerCase()}">
                  {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                </div>
                <select
                  value={applicant.status}
                  onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                  className="status-select"
                  disabled={updating[applicant.id]}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offered">Offered</option>
                </select>
                {updating[applicant.id] && <span className="updating-text">Updating...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;
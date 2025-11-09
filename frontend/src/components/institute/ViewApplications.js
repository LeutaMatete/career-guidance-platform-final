import React, { useState, useEffect } from 'react';
import { instituteService } from '../../services/instituteService';

const ViewApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await instituteService.getApplications(); // Assume this exists
      setApplications(data);
    } catch (err) {
      setError('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await instituteService.updateApplicationStatus(applicationId, newStatus);
      // Optimistically update UI
      setApplications(apps =>
        apps.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) return <div>Loading applicants...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-container">
      <h2>Student Applications</h2>
      <div className="applications-list">
        {applications.map(app => (
          <div key={app.id} className="application-card">
            <h4>{app.studentName}</h4>
            <p>Course: {app.courseTitle}</p>
            <p>Status: <strong>{app.status || 'pending'}</strong></p>
            <div className="action-buttons">
              {app.status !== 'approved' && (
                <button
                  onClick={() => handleStatusChange(app.id, 'approved')}
                  className="btn btn-success"
                >
                  Approve
                </button>
              )}
              {app.status !== 'rejected' && (
                <button
                  onClick={() => handleStatusChange(app.id, 'rejected')}
                  className="btn btn-danger"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewApplicants;
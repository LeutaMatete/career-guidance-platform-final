import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import '../../styles/institute.css'; // Link to your CSS file

const InstituteManagement = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [compliance, setCompliance] = useState(null);

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      const data = await adminService.getInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error('Error loading institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyInstitution = async (institutionId, isVerified) => {
    try {
      await adminService.verifyInstitution(institutionId, isVerified);
      alert(`Institution ${isVerified ? 'verified' : 'unverified'} successfully`);
      loadInstitutions();
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Failed to update verification status');
    }
  };

  const handleSuspendInstitution = async (institutionId, isSuspended, reason) => {
    try {
      await adminService.suspendInstitution(institutionId, isSuspended, reason);
      alert(`Institution ${isSuspended ? 'suspended' : 'activated'} successfully`);
      loadInstitutions();
    } catch (error) {
      console.error('Error updating suspension status:', error);
      alert('Failed to update suspension status');
    }
  };

  const loadInstitutionAnalytics = async (institutionId) => {
    try {
      const [analyticsData, complianceData] = await Promise.all([
        adminService.getInstitutionAnalytics(institutionId),
        adminService.checkInstitutionCompliance(institutionId)
      ]);
      setAnalytics(analyticsData);
      setCompliance(complianceData);
      setSelectedInstitution(institutionId);
    } catch (error) {
      console.error('Error loading institution analytics:', error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading institutions...</div>;
  }

  return (
    <div className="institute-management-page">
      <header className="page-header">
        <h1>Institution Management</h1>
        <p>Manage and monitor educational institutions in the system</p>
      </header>

      <section className="institutions-section">
        <h2>Registered Institutions</h2>
        {institutions.length === 0 ? (
          <div className="empty-state">
            <p>No institutions registered yet.</p>
          </div>
        ) : (
          <div className="institution-grid">
            {institutions.map(institution => (
              <div key={institution.id} className="institution-card">
                <div className="institution-details">
                  <h3>{institution.name}</h3>
                  <p>{institution.email}</p>
                  <p>{institution.phone}</p>
                  <div className="institution-stats">
                    <span>Courses: {institution.stats.totalCourses}</span>
                    <span>Applications: {institution.stats.totalApplications}</span>
                    <span>Pending: {institution.stats.activeApplications}</span>
                  </div>
                  <div className="institution-status">
                    <span className={`status-tag ${institution.isVerified ? 'verified' : 'unverified'}`}>
                      {institution.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className={`status-tag ${institution.isActive ? 'active' : 'suspended'}`}>
                      {institution.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
                <div className="institution-actions">
                  <button className="btn-outline" onClick={() => loadInstitutionAnalytics(institution.id)}>
                    View Analytics
                  </button>
                  <button
                    className={institution.isVerified ? 'btn-warning' : 'btn-success'}
                    onClick={() => handleVerifyInstitution(institution.id, !institution.isVerified)}
                  >
                    {institution.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                  <button
                    className={institution.isSuspended ? 'btn-success' : 'btn-danger'}
                    onClick={() => {
                      if (!institution.isSuspended) {
                        const reason = prompt('Enter suspension reason:');
                        if (reason) handleSuspendInstitution(institution.id, true, reason);
                      } else {
                        handleSuspendInstitution(institution.id, false, '');
                      }
                    }}
                  >
                    {institution.isSuspended ? 'Activate' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedInstitution && analytics && (
        <section className="analytics-panel">
          <h2>Institution Analytics</h2>
          <div className="stats-grid">
            <div className="stat-card"><h4>Faculties</h4><p>{analytics.overview.faculties}</p></div>
            <div className="stat-card"><h4>Courses</h4><p>{analytics.overview.courses}</p></div>
            <div className="stat-card"><h4>Applications</h4><p>{analytics.overview.applications}</p></div>
            <div className="stat-card"><h4>Admission Rate</h4><p>{analytics.overview.admissionRate}%</p></div>
          </div>

          <div className="admission-stats">
            <h3>Admission Statistics</h3>
            <div className="stat-item"><span>Total:</span><span>{analytics.admissionStats.total}</span></div>
            <div className="stat-item"><span>Admitted:</span><span className="admitted">{analytics.admissionStats.admitted}</span></div>
            <div className="stat-item"><span>Rejected:</span><span className="rejected">{analytics.admissionStats.rejected}</span></div>
            <div className="stat-item"><span>Pending:</span><span className="pending">{analytics.admissionStats.pending}</span></div>
          </div>

          {compliance && (
            <div className="compliance-section">
              <h3>Compliance Check</h3>
              <div className={`compliance-score score-${getComplianceLevel(compliance.complianceScore)}`}>
                <h4>Compliance Score: {compliance.complianceScore}%</h4>
              </div>
              {compliance.issues.length > 0 && (
                <div className="compliance-issues">
                  <h4>Issues</h4>
                  {compliance.issues.map((issue, index) => (
                    <div key={index} className={`compliance-issue ${issue.severity}`}>
                      <strong>{issue.type.replace('_', ' ').toUpperCase()}</strong>
                      <p>{issue.message}</p>
                      {issue.details && <small>Details: {issue.details.join(', ')}</small>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="btn-secondary" onClick={() => {
            setSelectedInstitution(null);
            setAnalytics(null);
            setCompliance(null);
          }}>
            Close Analytics
          </button>
        </section>
      )}
    </div>
  );
};

const getComplianceLevel = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
};

export default InstituteManagement;

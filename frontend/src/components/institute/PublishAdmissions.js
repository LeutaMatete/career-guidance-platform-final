import React, { useState, useEffect } from 'react';
import { instituteService } from '../../services/instituteService';

const PublishAdmissions = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [courses, setCourses] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, selectedCourse, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [applicationsData, coursesData] = await Promise.all([
        instituteService.getApplications(),
        instituteService.getCourses()
      ]);
      
      setApplications(applicationsData);
      setCourses(coursesData);
      setError('');
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load applications and courses');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(app => app.courseId === selectedCourse);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setError('');
      setSuccess('');

      await instituteService.updateApplicationStatus(applicationId, newStatus);
      
      setSuccess(`Application status updated to ${newStatus}`);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePublishAdmissions = async () => {
    if (!window.confirm('Are you sure you want to publish these admission decisions? This will notify all students of their results.')) {
      return;
    }

    try {
      setPublishing(true);
      setError('');
      setSuccess('');

      const approvedApplications = applications.filter(app => app.status === 'approved');
      
      if (approvedApplications.length === 0) {
        setError('No approved applications to publish');
        return;
      }

      await instituteService.publishAdmissions(approvedApplications);
      
      setSuccess(`Successfully published ${approvedApplications.length} admission decisions`);
      
      // Reload data to reflect changes
      await loadData();
      
    } catch (error) {
      console.error('Error publishing admissions:', error);
      setError('Failed to publish admissions: ' + (error.response?.data?.message || error.message));
    } finally {
      setPublishing(false);
    }
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Publish Admissions</h1>
        <p>Review applications and publish admission decisions</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Statistics Overview */}
      <div className="admission-stats-overview">
        <h3>Application Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <h4>Total Applications</h4>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-content">
              <h4>Pending Review</h4>
              <p className="stat-number">{stats.pending}</p>
            </div>
          </div>
          <div className="stat-card approved">
            <div className="stat-content">
              <h4>Approved</h4>
              <p className="stat-number">{stats.approved}</p>
            </div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-content">
              <h4>Rejected</h4>
              <p className="stat-number">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Course:</label>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="action-group">
          <button 
            onClick={handlePublishAdmissions}
            disabled={publishing || stats.approved === 0}
            className="btn btn-primary"
          >
            {publishing ? 'Publishing...' : `Publish ${stats.approved} Admissions`}
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="applications-section">
        <h3>
          Applications ({filteredApplications.length})
          {filteredApplications.length !== applications.length && (
            <span className="filtered-count"> (filtered from {applications.length})</span>
          )}
        </h3>

        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <p>No applications found matching your criteria.</p>
          </div>
        ) : (
          <div className="applications-table">
            <div className="table-header">
              <div className="table-cell">Student</div>
              <div className="table-cell">Course</div>
              <div className="table-cell">Applied Date</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Actions</div>
            </div>

            {filteredApplications.map(application => (
              <div key={application.id} className="table-row">
                <div className="table-cell">
                  <div className="student-info">
                    <strong>{application.studentName || 'Student ' + application.studentId}</strong>
                    <span>{application.studentEmail || ''}</span>
                  </div>
                </div>
                <div className="table-cell">
                  {getCourseName(application.courseId)}
                </div>
                <div className="table-cell">
                  {new Date(application.appliedAt?.toDate?.() || application.appliedAt).toLocaleDateString()}
                </div>
                <div className="table-cell">
                  <span className={`status-badge status-${application.status}`}>
                    {application.status}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleViewApplication(application)}
                      className="btn btn-outline"
                    >
                      View Details
                    </button>
                    
                    {application.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(application.id, 'approved')}
                          className="btn btn-success"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                          className="btn btn-danger"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {(application.status === 'approved' || application.status === 'rejected') && (
                      <button 
                        onClick={() => handleStatusChange(application.id, 'pending')}
                        className="btn btn-secondary"
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                Close
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Student Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Student ID:</strong>
                    <span>{selectedApplication.studentId}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{selectedApplication.studentName || 'Not available'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedApplication.studentEmail || 'Not available'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Course Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Course:</strong>
                    <span>{getCourseName(selectedApplication.courseId)}</span>
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
                    <span>{new Date(selectedApplication.updatedAt?.toDate?.() || selectedApplication.updatedAt || selectedApplication.appliedAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Current Status:</strong>
                    <span className={`status-badge status-${selectedApplication.status}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedApplication.qualificationReasons && (
                <div className="detail-section">
                  <h3>Qualification Check</h3>
                  <div className="qualification-info">
                    <strong>Qualification Status:</strong>
                    <span>{selectedApplication.metRequirements ? 'Met Requirements' : 'Did Not Meet Requirements'}</span>
                    
                    {selectedApplication.qualificationReasons.length > 0 && (
                      <div className="qualification-reasons">
                        <strong>Reasons:</strong>
                        <ul>
                          {selectedApplication.qualificationReasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
              
              {selectedApplication.status === 'pending' && (
                <div className="modal-actions">
                  <button 
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, 'approved');
                      setSelectedApplication(null);
                    }}
                    className="btn btn-success"
                  >
                    Approve Application
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, 'rejected');
                      setSelectedApplication(null);
                    }}
                    className="btn btn-danger"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishAdmissions;
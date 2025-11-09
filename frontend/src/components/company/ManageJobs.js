import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

const ManageJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filterStatus]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await companyService.getJobs();
      setJobs(jobsData);
      setError('');
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    if (filterStatus === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.status === filterStatus));
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      await companyService.deleteJob(jobId);
      
      setSuccess('Job deleted successfully');
      
      // Remove job from local state
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setError('');
      setSuccess('');

      await companyService.updateJob(jobId, { status: newStatus });
      
      setSuccess(`Job status updated to ${newStatus}`);
      
      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      
    } catch (error) {
      console.error('Error updating job status:', error);
      setError('Failed to update job status: ' + (error.response?.data?.message || error.message));
    }
  };

  const getApplicationCount = (jobId) => {
    // This would typically come from the backend
    // For now, we'll return a mock count
    return Math.floor(Math.random() * 20);
  };

  const getStatusStats = () => {
    const total = jobs.length;
    const active = jobs.filter(job => job.status === 'active').length;
    const draft = jobs.filter(job => job.status === 'draft').length;
    const closed = jobs.filter(job => job.status === 'closed').length;

    return { total, active, draft, closed };
  };

  const formatJobType = (jobType) => {
    return jobType ? jobType.charAt(0).toUpperCase() + jobType.slice(1).replace('-', ' ') : '';
  };

  const isJobExpired = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    return deadlineDate < new Date();
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading your jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Jobs</h1>
        <p>View and manage your job postings</p>
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

      {/* Statistics */}
      <div className="stats-overview">
        <h3>Job Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <h4>Total Jobs</h4>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-content">
              <h4>Active</h4>
              <p className="stat-number">{stats.active}</p>
            </div>
          </div>
          <div className="stat-card draft">
            <div className="stat-content">
              <h4>Draft</h4>
              <p className="stat-number">{stats.draft}</p>
            </div>
          </div>
          <div className="stat-card closed">
            <div className="stat-content">
              <h4>Closed</h4>
              <p className="stat-number">{stats.closed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/company/jobs/post'}
        >
          Post New Job
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <button 
            onClick={loadJobs}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="jobs-section">
        <h3>
          Your Jobs ({filteredJobs.length})
          {filteredJobs.length !== jobs.length && (
            <span className="filtered-count"> (filtered from {jobs.length})</span>
          )}
        </h3>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs found matching your criteria.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/company/jobs/post'}
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="jobs-table">
            <div className="table-header">
              <div className="table-cell">Job Title</div>
              <div className="table-cell">Type</div>
              <div className="table-cell">Applications</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Posted</div>
              <div className="table-cell">Deadline</div>
              <div className="table-cell">Actions</div>
            </div>

            {filteredJobs.map(job => {
              const expired = isJobExpired(job.applicationDeadline);
              const applicationCount = getApplicationCount(job.id);

              return (
                <div key={job.id} className={`table-row ${expired ? 'expired' : ''}`}>
                  <div className="table-cell">
                    <strong>{job.title}</strong>
                    <div className="job-category">{job.category}</div>
                  </div>
                  <div className="table-cell">
                    {formatJobType(job.jobType)}
                  </div>
                  <div className="table-cell">
                    <span className="application-count">{applicationCount}</span>
                  </div>
                  <div className="table-cell">
                    <span className={`status-badge status-${job.status}`}>
                      {job.status}
                      {expired && job.status === 'active' && ' (Expired)'}
                    </span>
                  </div>
                  <div className="table-cell">
                    {job.createdAt ? new Date(job.createdAt?.toDate?.() || job.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="table-cell">
                    {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Not set'}
                  </div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => window.location.href = `/company/jobs/${job.id}/applications`}
                        className="btn btn-outline"
                      >
                        View Applicants
                      </button>
                      
                      {job.status === 'active' && (
                        <button 
                          onClick={() => handleStatusChange(job.id, 'closed')}
                          className="btn btn-warning"
                        >
                          Close
                        </button>
                      )}
                      
                      {job.status === 'closed' && (
                        <button 
                          onClick={() => handleStatusChange(job.id, 'active')}
                          className="btn btn-success"
                        >
                          Reopen
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={deleting}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
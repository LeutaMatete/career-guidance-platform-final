import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const JobListings = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, filterType, filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, applicationsData] = await Promise.all([
        studentService.getAvailableJobs(),
        studentService.getMyJobApplications()
      ]);
      
      setJobs(jobsData);
      setMyApplications(applicationsData);
      setError('');
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by job type
    if (filterType !== 'all') {
      filtered = filtered.filter(job => job.jobType === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(job => job.category === filterCategory);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(true);
      setError('');

      await studentService.applyForJob({ jobId });
      
      // Update local state
      setMyApplications(prev => [...prev, {
        jobId: jobId,
        status: 'pending'
      }]);
      
      // Show success message
      const job = jobs.find(j => j.id === jobId);
      setError(`Successfully applied for "${job?.title}"!`);
      
    } catch (error) {
      console.error('Error applying for job:', error);
      setError('Failed to apply for job: ' + (error.response?.data?.message || error.message));
    } finally {
      setApplying(false);
    }
  };

  const hasApplied = (jobId) => {
    return myApplications.some(app => app.jobId === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const application = myApplications.find(app => app.jobId === jobId);
    return application ? application.status : null;
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(jobs.map(job => job.category).filter(Boolean))];
    return categories;
  };

  const isJobExpired = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    return deadlineDate < new Date();
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Not specified';
    return salaryRange;
  };

  const formatJobType = (jobType) => {
    return jobType ? jobType.charAt(0).toUpperCase() + jobType.slice(1).replace('-', ' ') : '';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading job listings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Job Opportunities</h1>
        <p>Browse and apply for job openings from various companies</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div className="filter-group">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <button 
            onClick={loadData}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="jobs-section">
        <h3>
          Available Jobs ({filteredJobs.length})
          {filteredJobs.length !== jobs.length && (
            <span className="filtered-count"> (filtered from {jobs.length})</span>
          )}
        </h3>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => {
              const applied = hasApplied(job.id);
              const applicationStatus = getApplicationStatus(job.id);
              const expired = isJobExpired(job.applicationDeadline);

              return (
                <div key={job.id} className={`job-card ${expired ? 'expired' : ''}`}>
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <div className="job-meta">
                      <span className="company-name">{job.companyName}</span>
                      <span className="job-type">{formatJobType(job.jobType)}</span>
                      {job.category && (
                        <span className="job-category">{job.category}</span>
                      )}
                    </div>
                  </div>

                  <div className="job-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Location:</strong>
                        <span>{job.location || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Salary:</strong>
                        <span>{formatSalary(job.salaryRange)}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Experience:</strong>
                        <span>{job.experienceLevel ? job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1) : 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Education:</strong>
                        <span>{job.educationLevel ? job.educationLevel.charAt(0).toUpperCase() + job.educationLevel.slice(1).replace('_', ' ') : 'Not specified'}</span>
                      </div>
                    </div>

                    {job.description && (
                      <div className="job-description">
                        <p>{job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}</p>
                      </div>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div className="job-skills">
                        <strong>Skills:</strong>
                        <div className="skills-list">
                          {job.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="job-footer">
                      <div className="deadline-info">
                        <strong>Application Deadline:</strong>
                        <span>{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Not specified'}</span>
                        {expired && <span className="expired-badge">Expired</span>}
                      </div>

                      <div className="job-actions">
                        {expired ? (
                          <button className="btn btn-disabled" disabled>
                            Application Closed
                          </button>
                        ) : applied ? (
                          <button className="btn btn-outline" disabled>
                            {applicationStatus === 'pending' ? 'Application Pending' : 'Applied'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={applying}
                            className="btn btn-primary"
                          >
                            {applying ? 'Applying...' : 'Apply Now'}
                          </button>
                        )}
                      </div>
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

export default JobListings;
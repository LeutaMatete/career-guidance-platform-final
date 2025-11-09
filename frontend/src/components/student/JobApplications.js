import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const JobApplications = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myJobApplications, setMyJobApplications] = useState([]);
  const [profileData, setProfileData] = useState({
    documents: {
      transcripts: [],
      certificates: [],
      identification: [],
      other: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatch, setFilterMatch] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [jobsData, jobApplicationsData, profileResponse] = await Promise.all([
        studentService.getAvailableJobs(),
        studentService.getMyJobApplications(),
        studentService.getProfile()
      ]);

      setJobs(jobsData || []);
      setMyJobApplications(jobApplicationsData || []);
      // Ensure the profileData structure is always correct and safe
      setProfileData({
        ...profileResponse,
        documents: {
          transcripts: Array.isArray(profileResponse.documents?.transcripts) ? profileResponse.documents.transcripts : [],
          certificates: Array.isArray(profileResponse.documents?.certificates) ? profileResponse.documents.certificates : [],
          identification: Array.isArray(profileResponse.documents?.identification) ? profileResponse.documents.identification : [],
          other: Array.isArray(profileResponse.documents?.other) ? profileResponse.documents.other : [],
        }
      });

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load job opportunities. Please try again later.');
      // Set default safe structure on error
      setProfileData({
        documents: {
          transcripts: [],
          certificates: [],
          identification: [],
          other: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Function that correctly receives an array and checks for final transcripts
  const hasFinalTranscripts = (transcriptArray) => {
    // Add a check to ensure transcriptArray is an array before calling .some()
    if (!Array.isArray(transcriptArray)) {
      console.warn('transcriptArray is not an array:', transcriptArray);
      return false; // Return false if it's not an array
    }
    return transcriptArray.some(doc =>
      doc.name?.toLowerCase().includes('transcript') &&
      doc.name?.toLowerCase().includes('final')
    );
  };

  // Helper to get the current transcripts array safely
  const getCurrentTranscripts = () => {
    return profileData.documents?.transcripts || [];
  };

  const isJobApplied = (jobId) => {
    return myJobApplications.some(app => app.jobId === jobId);
  };

  const handleApplyForJob = async (job) => {
    if (!hasFinalTranscripts(getCurrentTranscripts())) {
      setError('You must upload your final academic transcripts before applying for jobs.');
      return;
    }

    if (isJobApplied(job.id)) {
      setError('You have already applied for this job.');
      return;
    }

    if (job.matchScore < 50) {
      if (!window.confirm(`Your match score for this job is low (${job.matchScore}%). Are you sure you want to apply?`)) {
        return;
      }
    }

    setApplying(true);
    setError('');
    setSuccess('');

    try {
      const result = await studentService.applyForJob({
        jobId: job.id
      });

      setSuccess(`Successfully applied for "${job.title}" at ${job.companyName}!`);
      await loadData(); // Refresh data after successful application

    } catch (error) {
      console.error('Error applying for job:', error);
      setError(error.response?.data?.message || 'Failed to apply for job. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleTranscriptUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload PDF, JPG, or PNG files only');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create a new document object for the uploaded file
      const newTranscript = {
        id: Date.now().toString(), // Generate a temporary ID
        name: file.name,
        type: 'transcripts', // Set the type
        category: 'final_transcript', // Set the category
        isFinal: true,
        uploadedAt: new Date().toISOString(),
        // In a real scenario, you would upload the file to a cloud storage
        // and store the resulting URL here. For now, we store just the name.
        // url: 'https://path-to-your-stored-file.com/file.pdf'
      };

      // Get the current documents structure
      const currentDocuments = profileData.documents || {
        transcripts: [],
        certificates: [],
        identification: [],
        other: []
      };

      // Add the new transcript to the transcripts array
      const updatedTranscripts = [...currentDocuments.transcripts, newTranscript];

      // Create the updated documents object
      const updatedDocuments = {
        ...currentDocuments,
        transcripts: updatedTranscripts
      };

      // Update the user's profile in the database via the service
      // Note: This assumes your service has an updateProfile method that accepts the full documents object
      await studentService.updateProfile({ ...profileData, documents: updatedDocuments });

      // Update the local state to reflect the change
      setProfileData(prev => ({
        ...prev,
        documents: updatedDocuments
      }));

      setSuccess('Final transcript uploaded successfully! You can now apply for jobs.');
      event.target.value = ''; // Clear the file input

    } catch (error) {
      console.error('Error uploading transcript:', error);
      setError('Failed to upload transcript. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getJobStatusBadge = (status, matchScore) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Under Review' },
      reviewed: { class: 'status-reviewed', text: 'Being Reviewed' },
      interview: { class: 'status-interview', text: 'Interview Stage' },
      rejected: { class: 'status-rejected', text: 'Not Selected' },
      offered: { class: 'status-offered', text: 'Job Offered' }
    };

    const config = statusConfig[status] || { class: 'status-pending', text: status };

    return (
      <div className="job-status">
        <span className={`status-badge ${config.class}`}>
          {config.text}
        </span>
        {matchScore && (
          <span className={`match-score match-${getMatchLevel(matchScore)}`}>
            {matchScore}% Match
          </span>
        )}
      </div>
    );
  };

  const getMatchLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very-low';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterMatch === 'all' ||
      (filterMatch === 'high' && job.matchScore >= 80) ||
      (filterMatch === 'medium' && job.matchScore >= 60 && job.matchScore < 80) ||
      (filterMatch === 'low' && job.matchScore < 60);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Loading job opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Job Opportunities</h1>
        <p>Browse and apply for jobs that match your qualifications</p>
        <div className="header-actions">
          <button
            onClick={loadData}
            className="btn btn-outline btn-sm"
            disabled={loading}
          >
            Refresh Jobs
          </button>
        </div>
      </div>

      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Transcript Upload Section */}
      <div className="transcript-section">
        <div className="transcript-header">
          <h3>Academic Transcripts</h3>
          <div className={`transcript-status ${hasFinalTranscripts(getCurrentTranscripts()) ? 'uploaded' : 'missing'}`}>
            {hasFinalTranscripts(getCurrentTranscripts()) ? 'Transcripts Ready' : 'Upload Required'}
          </div>
        </div>

        <div className="transcript-upload">
          <p>
            {hasFinalTranscripts(getCurrentTranscripts())
              ? 'Your final transcripts are uploaded. You can apply for jobs.'
              : 'Upload your final academic transcripts to apply for jobs.'
            }
          </p>

          <div className="upload-area">
            <input
              type="file"
              id="transcript-upload"
              onChange={handleTranscriptUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <label htmlFor="transcript-upload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
              <div className="upload-text">
                {uploading ? 'Uploading...' : 'Upload Final Transcript'}
              </div>
              <small>PDF, JPG, PNG (Max 10MB)</small>
            </label>
          </div>

          {getCurrentTranscripts().length > 0 && (
            <div className="transcripts-list">
              <h4>Uploaded Transcripts:</h4>
              {getCurrentTranscripts()
                .filter(doc => doc.category === 'final_transcript')
                .map(transcript => (
                  <div key={transcript.id} className="transcript-item">
                    <div className="transcript-info">
                      <strong>{transcript.name}</strong>
                      <span>Uploaded: {new Date(transcript.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    {transcript.isFinal && <span className="final-badge">Final</span>}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* My Job Applications */}
      {myJobApplications.length > 0 && (
        <div className="my-applications-section">
          <h3>My Job Applications ({myJobApplications.length})</h3>
          <div className="applications-grid">
            {myJobApplications.map(application => (
              <div key={application.id} className="application-card">
                <div className="application-info">
                  <h4>{application.jobTitle}</h4>
                  <p className="company-name">{application.companyName}</p>
                  <p className="application-date">
                    Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="application-details">
                  {getJobStatusBadge(application.status, application.matchScore)}
                  {application.matchScore && (
                    <div className="match-details">
                      <small>Auto-matched based on your profile</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Search and Filters */}
      <div className="job-search-section">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <label>Match Filter:</label>
            <select
              value={filterMatch}
              onChange={(e) => setFilterMatch(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Jobs</option>
              <option value="high">High Match (80%+)</option>
              <option value="medium">Medium Match (60-79%)</option>
              <option value="low">Lower Match (-60%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Available Jobs */}
      <div className="jobs-section">
        <h3>
          Available Jobs
          <span className="jobs-count">({filteredJobs.length})</span>
        </h3>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs match your search criteria.</p>
            {jobs.length === 0 ? (
              <p>No job opportunities available at the moment. Please check back later.</p>
            ) : (
              <button
                onClick={() => { setSearchTerm(''); setFilterMatch('all'); }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => {
              const isApplied = isJobApplied(job.id);
              const canApply = hasFinalTranscripts(getCurrentTranscripts()) && !isApplied;

              return (
                <div key={job.id} className={`job-card ${isApplied ? 'applied' : ''} match-${getMatchLevel(job.matchScore)}`}>
                  <div className="job-header">
                    <div className="job-title-section">
                      <h4>{job.title}</h4>
                      <span className="company-badge">{job.companyName}</span>
                    </div>
                    <div className="job-match">
                      <div className={`match-indicator match-${getMatchLevel(job.matchScore)}`}>
                        {job.matchScore}% Match
                      </div>
                    </div>
                  </div>

                  <div className="job-details">
                    <p className="job-description">{job.description}</p>

                    <div className="job-requirements">
                      <div className="requirement">
                        <strong>Education:</strong> {job.requiredEducation || 'Not specified'}
                      </div>
                      <div className="requirement">
                        <strong>Experience:</strong> {job.requiredExperience ? `${job.requiredExperience} years` : 'Not specified'}
                      </div>
                      <div className="requirement">
                        <strong>Skills:</strong> {job.requiredSkills || 'Not specified'}
                      </div>
                      <div className="requirement">
                        <strong>Location:</strong> {job.location || 'Not specified'}
                      </div>
                      <div className="requirement">
                        <strong>Salary:</strong> {job.salaryRange || 'Not specified'}
                      </div>
                    </div>

                    <div className="job-meta">
                      <span className="post-date">
                        Posted: {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently'}
                      </span>
                      {job.applicationDeadline && (
                        <span className="deadline">
                          Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="job-actions">
                    {isApplied ? (
                      <div className="already-applied">
                        <span>Applied</span>
                        {getJobStatusBadge(
                          myJobApplications.find(app => app.jobId === job.id)?.status,
                          job.matchScore
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyForJob(job)}
                        disabled={!canApply || applying}
                        className={`btn apply-btn ${canApply ? 'btn-primary' : 'btn-disabled'}`}
                      >
                        {applying ? 'Applying...' :
                          canApply ? `Apply Now (${job.matchScore}% Match)` :
                            'Upload Transcripts to Apply'}
                      </button>
                    )}
                  </div>

                  <div className="match-explanation">
                    <small>
                      <strong>Why this match?</strong> Based on your education, skills, and experience compared to job requirements.
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Application Guidelines */}
      <div className="guidelines-section">
        <h3>Job Application Guidelines</h3>
        <div className="guidelines-grid">
          <div className="guideline-card">
            <div className="guideline-content">
              <h4>Upload Transcripts</h4>
              <p>Upload your final academic transcripts before applying for jobs</p>
            </div>
          </div>
          <div className="guideline-card">
            <div className="guideline-content">
              <h4>Auto-Matching</h4>
              <p>System automatically matches you with jobs based on your qualifications</p>
            </div>
          </div>
          <div className="guideline-card">
            <div className="guideline-content">
              <h4>Easy Application</h4>
              <p>One-click application with your profile and documents</p>
            </div>
          </div>
          <div className="guideline-card">
            <div className="guideline-content">
              <h4>Notifications</h4>
              <p>Receive alerts for new jobs matching your profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;
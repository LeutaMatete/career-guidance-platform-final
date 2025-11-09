import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

const PostJob = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    jobType: 'full-time',
    salaryRange: '',
    applicationDeadline: '',
    category: '',
    experienceLevel: 'entry',
    educationLevel: 'high_school',
    skills: []
  });

  const jobTypes = [
    'full-time', 'part-time', 'contract', 'internship', 'remote'
  ];

  const experienceLevels = [
    'entry', 'mid', 'senior', 'executive'
  ];

  const educationLevels = [
    'high_school', 'diploma', 'bachelors', 'masters', 'phd'
  ];

  const categories = [
    'Technology', 'Business', 'Healthcare', 'Education', 'Engineering',
    'Marketing', 'Sales', 'Design', 'Finance', 'Operations'
  ];

  useEffect(() => {
    // Set default application deadline to 30 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    setJobData(prev => ({
      ...prev,
      applicationDeadline: defaultDeadline.toISOString().split('T')[0]
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setJobData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!jobData.title.trim()) {
      setError('Job title is required');
      return;
    }

    if (!jobData.description.trim()) {
      setError('Job description is required');
      return;
    }

    if (!jobData.applicationDeadline) {
      setError('Application deadline is required');
      return;
    }

    // Validate deadline is in the future
    const deadline = new Date(jobData.applicationDeadline);
    const today = new Date();
    if (deadline <= today) {
      setError('Application deadline must be in the future');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await companyService.createJob(jobData);
      
      setSuccess('Job posted successfully!');
      
      // Reset form
      setJobData({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        location: '',
        jobType: 'full-time',
        salaryRange: '',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: '',
        experienceLevel: 'entry',
        educationLevel: 'high_school',
        skills: []
      });
      
    } catch (error) {
      console.error('Error posting job:', error);
      setError('Failed to post job: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Post New Job</h1>
        <p>Create a new job posting to attract qualified candidates</p>
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

      <div className="form-container">
        <form onSubmit={handleSubmit} className="job-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={jobData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={jobData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="jobType">Job Type *</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={jobData.jobType}
                  onChange={handleInputChange}
                  required
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={jobData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY or Remote"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salaryRange">Salary Range</label>
                <input
                  type="text"
                  id="salaryRange"
                  name="salaryRange"
                  value={jobData.salaryRange}
                  onChange={handleInputChange}
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="applicationDeadline">Application Deadline *</label>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={jobData.applicationDeadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="form-section">
            <h3>Requirements & Qualifications</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={jobData.experienceLevel}
                  onChange={handleInputChange}
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="educationLevel">Minimum Education</label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  value={jobData.educationLevel}
                  onChange={handleInputChange}
                >
                  {educationLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="skills">Required Skills (comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  onChange={handleSkillsChange}
                  placeholder="e.g., JavaScript, React, Node.js, AWS"
                />
                <small>Separate multiple skills with commas</small>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="form-section">
            <h3>Job Details</h3>
            
            <div className="form-group">
              <label htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                name="description"
                value={jobData.description}
                onChange={handleInputChange}
                placeholder="Describe the role, team, and company culture..."
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="responsibilities">Key Responsibilities</label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                value={jobData.responsibilities}
                onChange={handleInputChange}
                placeholder="List the main responsibilities and duties..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements & Qualifications</label>
              <textarea
                id="requirements"
                name="requirements"
                value={jobData.requirements}
                onChange={handleInputChange}
                placeholder="List specific requirements, qualifications, and experience needed..."
                rows="4"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
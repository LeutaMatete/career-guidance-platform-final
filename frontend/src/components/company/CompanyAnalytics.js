import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';

const CompanyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await companyService.getAnalytics();
      setAnalytics(analyticsData);
      setError('');
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getApplicationStatusData = () => {
    if (!analytics) return [];
    
    return [
      { status: 'Pending', count: analytics.pendingApplications, color: '#ffc107' },
      { status: 'Reviewed', count: analytics.reviewedApplications, color: '#17a2b8' },
      { status: 'Interview', count: analytics.interviewApplications || 0, color: '#007bff' },
      { status: 'Hired', count: analytics.hiredCount, color: '#28a745' },
      { status: 'Rejected', count: analytics.rejectedApplications || 0, color: '#dc3545' }
    ];
  };

  const getTopJobs = () => {
    if (!analytics.topJobs) {
      return [
        { title: 'Software Engineer', applications: 45 },
        { title: 'Product Manager', applications: 32 },
        { title: 'Data Analyst', applications: 28 },
        { title: 'UX Designer', applications: 21 },
        { title: 'Marketing Specialist', applications: 15 }
      ];
    }
    return analytics.topJobs;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Company Analytics</h1>
        <p>Track your job posting performance and applicant metrics</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Time Range Filter */}
      <div className="analytics-filter">
        <div className="filter-group">
          <label>Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        <button 
          onClick={loadAnalytics}
          className="btn btn-outline"
        >
          Refresh Data
        </button>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="analytics-metrics">
            <h2>Key Performance Indicators</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{analytics.totalJobs}</div>
                <div className="metric-label">Total Jobs Posted</div>
                <div className="metric-trend">
                  {analytics.activeJobs} active, {analytics.totalJobs - analytics.activeJobs} closed
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{analytics.totalApplications}</div>
                <div className="metric-label">Total Applications</div>
                <div className="metric-trend">
                  {calculatePercentage(analytics.totalApplications, analytics.totalApplications)}% of all applications
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{analytics.hiredCount}</div>
                <div className="metric-label">Successful Hires</div>
                <div className="metric-trend">
                  {calculatePercentage(analytics.hiredCount, analytics.totalApplications)}% hire rate
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">
                  {analytics.totalApplications > 0 ? Math.round(analytics.totalApplications / analytics.totalJobs) : 0}
                </div>
                <div className="metric-label">Avg. Applications per Job</div>
                <div className="metric-trend">
                  Across all job postings
                </div>
              </div>
            </div>
          </div>

          {/* Application Statistics */}
          <div className="analytics-section">
            <h2>Application Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{analytics.pendingApplications}</div>
                <div className="stat-label">Pending Review</div>
                <div className="stat-percentage">
                  {calculatePercentage(analytics.pendingApplications, analytics.totalApplications)}%
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-value">{analytics.reviewedApplications}</div>
                <div className="stat-label">Under Review</div>
                <div className="stat-percentage">
                  {calculatePercentage(analytics.reviewedApplications, analytics.totalApplications)}%
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-value">{analytics.interviewApplications || 0}</div>
                <div className="stat-label">Interview Stage</div>
                <div className="stat-percentage">
                  {calculatePercentage(analytics.interviewApplications || 0, analytics.totalApplications)}%
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-value">{analytics.hiredCount}</div>
                <div className="stat-label">Hired</div>
                <div className="stat-percentage">
                  {calculatePercentage(analytics.hiredCount, analytics.totalApplications)}%
                </div>
              </div>
            </div>
          </div>

          {/* Application Status Chart */}
          <div className="analytics-section">
            <h2>Application Status Distribution</h2>
            <div className="status-chart">
              {getApplicationStatusData().map((item, index) => (
                <div key={index} className="status-item-chart">
                  <div className="status-info">
                    <span className="status-name">{item.status}</span>
                    <span className="status-count">{item.count}</span>
                    <span className="status-percentage">
                      {calculatePercentage(item.count, analytics.totalApplications)}%
                    </span>
                  </div>
                  <div className="status-bar-container">
                    <div 
                      className="status-bar"
                      style={{ 
                        width: `${calculatePercentage(item.count, analytics.totalApplications)}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div className="analytics-section">
            <h2>Top Performing Jobs</h2>
            <div className="jobs-performance">
              {getTopJobs().map((job, index) => (
                <div key={index} className="job-performance-item">
                  <div className="job-info">
                    <div className="job-title">{job.title}</div>
                    <div className="job-applications">{job.applications} applications</div>
                  </div>
                  <div className="job-popularity">
                    <div 
                      className="popularity-bar"
                      style={{ 
                        width: `${(job.applications / Math.max(...getTopJobs().map(j => j.applications))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="analytics-section">
            <h2>Performance Insights</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Application Response Time</h4>
                <div className="insight-value">2.3 days</div>
                <div className="insight-description">
                  Average time to respond to applications
                </div>
              </div>
              
              <div className="insight-card">
                <h4>Top Application Source</h4>
                <div className="insight-value">Career Platform</div>
                <div className="insight-description">
                  Majority of applications come from this platform
                </div>
              </div>
              
              <div className="insight-card">
                <h4>Best Performing Category</h4>
                <div className="insight-value">Technology</div>
                <div className="insight-description">
                  Highest number of qualified applicants
                </div>
              </div>
              
              <div className="insight-card">
                <h4>Candidate Quality</h4>
                <div className="insight-value">High</div>
                <div className="insight-description">
                  {calculatePercentage(analytics.hiredCount, analytics.totalApplications)}% of applicants meet requirements
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="analytics-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button className="btn btn-primary">
                Download Report
              </button>
              <button className="btn btn-outline">
                View Detailed Applications
              </button>
              <button className="btn btn-outline">
                Compare Periods
              </button>
            </div>
          </div>
        </>
      )}

      {!analytics && !loading && (
        <div className="empty-state">
          <h3>No Analytics Data Available</h3>
          <p>Start by posting jobs and receiving applications to see analytics data.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/company/jobs/post'}
          >
            Post Your First Job
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyAnalytics;
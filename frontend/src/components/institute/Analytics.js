import React, { useState, useEffect } from 'react';
import { instituteService } from '../../services/instituteService';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    popularCourses: [],
    applicationTrends: [],
    admissionStats: {
      totalAdmitted: 0,
      admissionRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get real applications data
      const applications = await instituteService.getApplications();
      
      // Calculate statistics from real data
      const totalApplications = applications.length || 0;
      const pendingApplications = applications.filter(app => app.status === 'pending').length || 0;
      const approvedApplications = applications.filter(app => app.status === 'approved' || app.status === 'admitted').length || 0;
      const rejectedApplications = applications.filter(app => app.status === 'rejected').length || 0;
      
      // Get courses to calculate popularity
      const courses = await instituteService.getCourses();
      const popularCourses = courses.map(course => {
        const courseApplications = applications.filter(app => app.courseId === course.id);
        const admissionRate = courseApplications.length > 0 
          ? Math.round((courseApplications.filter(app => app.status === 'approved' || app.status === 'admitted').length / courseApplications.length) * 100)
          : 0;
        
        return {
          name: course.name,
          applications: courseApplications.length,
          admissionRate: admissionRate
        };
      }).sort((a, b) => b.applications - a.applications).slice(0, 5);

      // Calculate application trends (last 6 months)
      const applicationTrends = calculateApplicationTrends(applications);
      
      // Calculate admission stats
      const totalAdmitted = approvedApplications;
      const admissionRate = totalApplications > 0 ? Math.round((totalAdmitted / totalApplications) * 100) : 0;

      setAnalytics({
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        popularCourses,
        applicationTrends,
        admissionStats: {
          totalAdmitted,
          admissionRate
        }
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
      // Set all values to zero if there's an error or no data
      setAnalytics({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        popularCourses: [],
        applicationTrends: [],
        admissionStats: {
          totalAdmitted: 0,
          admissionRate: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateApplicationTrends = (applications) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Get last 6 months
    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      lastSixMonths.push(months[monthIndex]);
    }
    
    // Count applications per month
    const trends = lastSixMonths.map(month => {
      // For demo purposes, we'll return zeros since we don't have date data
      // In a real implementation, you would filter applications by month
      return {
        month: month,
        applications: 0
      };
    });
    
    return trends;
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getTrendText = () => {
    if (analytics.totalApplications === 0) {
      return "No applications yet";
    }
    // Simple trend calculation - in real app, compare with previous period
    return "Application data for current period";
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
        <h1>Institute Analytics</h1>
        <p>Comprehensive overview of your institution's performance and application statistics</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Time Range Filter */}
      <div className="analytics-filter">
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

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <h2>Key Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{analytics.totalApplications}</div>
            <div className="metric-label">Total Applications</div>
            <div className="metric-trend">
              {getTrendText()}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{analytics.pendingApplications}</div>
            <div className="metric-label">Pending Review</div>
            <div className="metric-description">Awaiting decision</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{analytics.approvedApplications}</div>
            <div className="metric-label">Approved</div>
            <div className="metric-trend">
              {calculatePercentage(analytics.approvedApplications, analytics.totalApplications)}% approval rate
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{analytics.rejectedApplications}</div>
            <div className="metric-label">Rejected</div>
            <div className="metric-trend">
              {calculatePercentage(analytics.rejectedApplications, analytics.totalApplications)}% rejection rate
            </div>
          </div>
        </div>
      </div>

      {/* Admission Statistics */}
      <div className="analytics-section">
        <h2>Admission Statistics</h2>
        <div className="admission-stats">
          <div className="stat-item">
            <div className="stat-value">{analytics.admissionStats.totalAdmitted}</div>
            <div className="stat-label">Total Students Admitted</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{analytics.admissionStats.admissionRate}%</div>
            <div className="stat-label">Overall Admission Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {analytics.totalApplications > 0 ? Math.round(analytics.totalApplications / 6) : 0}
            </div>
            <div className="stat-label">Average Monthly Applications</div>
          </div>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="analytics-section">
        <h2>Course Application Statistics</h2>
        {analytics.popularCourses.length === 0 ? (
          <div className="empty-state">
            <p>No course applications received yet</p>
          </div>
        ) : (
          <div className="courses-list">
            {analytics.popularCourses.map((course, index) => (
              <div key={index} className="course-item">
                <div className="course-info">
                  <div className="course-name">{course.name}</div>
                  <div className="course-stats">
                    <span className="applications">{course.applications} applications</span>
                    <span className="admission-rate">{course.admissionRate}% admission rate</span>
                  </div>
                </div>
                {course.applications > 0 && (
                  <div className="course-popularity">
                    <div 
                      className="popularity-bar"
                      style={{ width: `${(course.applications / Math.max(...analytics.popularCourses.map(c => c.applications))) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Trends */}
      <div className="analytics-section">
        <h2>Application Trends</h2>
        {analytics.applicationTrends.every(trend => trend.applications === 0) ? (
          <div className="empty-state">
            <p>No application trend data available for the selected period</p>
          </div>
        ) : (
          <div className="trends-chart">
            {analytics.applicationTrends.map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-month">{trend.month}</div>
                <div className="trend-bar-container">
                  <div 
                    className="trend-bar"
                    style={{ 
                      height: trend.applications > 0 ? `${(trend.applications / Math.max(...analytics.applicationTrends.map(t => t.applications))) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
                <div className="trend-value">{trend.applications}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="analytics-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="btn btn-primary">
            Download Report
          </button>
          <button 
            className="btn btn-outline"
            onClick={loadAnalytics}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Insights */}
      <div className="analytics-section">
        <h2>Performance Insights</h2>
        <div className="insights-list">
          {analytics.totalApplications === 0 ? (
            <div className="insight-item">
              <div className="insight-title">No Applications Yet</div>
              <div className="insight-description">
                Your institution hasn't received any applications yet. Consider promoting your courses 
                and ensuring they are visible to prospective students.
              </div>
            </div>
          ) : (
            <>
              <div className="insight-item">
                <div className="insight-title">Application Overview</div>
                <div className="insight-description">
                  Your institution has received {analytics.totalApplications} applications. 
                  {analytics.pendingApplications > 0 ? ` There are ${analytics.pendingApplications} applications pending review.` : ' All applications have been processed.'}
                </div>
              </div>
              
              {analytics.admissionStats.admissionRate > 0 && (
                <div className="insight-item">
                  <div className="insight-title">Admission Performance</div>
                  <div className="insight-description">
                    The current admission rate is {analytics.admissionStats.admissionRate}%. 
                    {analytics.admissionStats.admissionRate < 30 ? ' This indicates a highly selective admission process.' : 
                     analytics.admissionStats.admissionRate > 70 ? ' This suggests an inclusive admission approach.' : 
                     ' This represents a balanced admission strategy.'}
                  </div>
                </div>
              )}
              
              {analytics.popularCourses.length > 0 && (
                <div className="insight-item">
                  <div className="insight-title">Course Popularity</div>
                  <div className="insight-description">
                    {analytics.popularCourses[0].name} is your most popular course with {analytics.popularCourses[0].applications} applications.
                    {analytics.popularCourses[0].admissionRate > 0 ? ` It has an admission rate of ${analytics.popularCourses[0].admissionRate}%.` : ''}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
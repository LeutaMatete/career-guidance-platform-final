import React, { useState, useEffect } from 'react';
import { instituteService } from '../../services/instituteService';
import { useAuth } from '../../context/AuthContext';

const PublishResults = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [applications, setApplications] = useState([]); // Applications for the selected course
  const [results, setResults] = useState([]); // State to hold results to publish
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const coursesData = await instituteService.getCourses(); // Assume this service method exists
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationsForCourse = async (courseId) => {
    try {
      // This might require a new service method or adapting getApplications
      // For now, assume a method exists or filter locally if data is already loaded
      // const appsForCourse = await instituteService.getApplicationsForCourse(courseId);
      // setApplications(appsForCourse);

      // Example: If you have all applications loaded, filter them:
      // const allApps = await instituteService.getApplications();
      // setApplications(allApps.filter(app => app.courseId === courseId));

      // Placeholder - replace with actual service call
      setApplications([]); // Reset if courseId changes
      setResults([]); // Reset results state
    } catch (error) {
      console.error('Error loading applications for course:', error);
      setError('Failed to load applications for the selected course');
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      loadApplicationsForCourse(selectedCourse);
    } else {
        setApplications([]);
        setResults([]);
    }
  }, [selectedCourse]);

  // Initialize results state when applications are loaded
  useEffect(() => {
    if (applications.length > 0 && results.length === 0) {
      const initialResults = applications.map(app => ({
        studentId: app.studentId,
        studentName: app.studentName, // Assuming this is available from the application
        status: 'pending', // Default status before publishing
        score: app.matchScore || 0 // Example: use match score or default to 0
      }));
      setResults(initialResults);
    }
  }, [applications]); // Only run when applications change and results is empty


  const handleStatusChange = (studentId, newStatus) => {
    setResults(prevResults =>
      prevResults.map(result =>
        result.studentId === studentId ? { ...result, status: newStatus } : result
      )
    );
  };

  const handlePublish = async () => {
    if (!selectedCourse || results.length === 0) {
      setError('Please select a course and set at least one result status.');
      return;
    }

    // Filter out results that are still 'pending' if you don't want to publish them
    const resultsToPublish = results.filter(r => r.status !== 'pending');

    if (resultsToPublish.length === 0) {
        setError('No results with a status other than "pending" to publish.');
        return;
    }

    setPublishing(true);
    setError('');
    setSuccess('');

    try {
      await instituteService.publishResults(selectedCourse, resultsToPublish);
      setSuccess(`Successfully published results for ${resultsToPublish.length} students!`);
      // Optionally reset the form or clear results state after publishing
      // setResults([]);
    } catch (error) {
      setError(error.message || 'Failed to publish results');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading courses...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Publish Admission Results</h1>
        <p>Select a course and set admission statuses for applicants</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="form-group">
          <label>Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="form-control"
          >
            <option value="">-- Select a Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div className="card">
          <h3>Applications for {courses.find(c => c.id === selectedCourse)?.title}</h3>
          {applications.length === 0 ? (
            <p>No applications found for this course.</p>
          ) : (
            <div className="applications-results-list">
              {results.map(result => (
                <div key={result.studentId} className="application-result-item">
                  <div className="student-info">
                    <strong>{result.studentName}</strong> (ID: {result.studentId})
                  </div>
                  <div className="status-selector">
                    <select
                      value={result.status}
                      onChange={(e) => handleStatusChange(result.studentId, e.target.value)}
                      className="form-control"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accept</option>
                      <option value="rejected">Reject</option>
                      <option value="waitlisted">Waitlist</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || results.length === 0}
            className="btn btn-primary"
          >
            {publishing ? 'Publishing...' : 'Publish Selected Results'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PublishResults;
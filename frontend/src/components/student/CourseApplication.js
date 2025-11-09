import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const CourseApplication = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [filterQualification, setFilterQualification] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterInstitution, filterQualification]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, applicationsData] = await Promise.all([
        studentService.getAvailableCourses(),
        studentService.getMyApplications()
      ]);
      
      setCourses(coursesData);
      setMyApplications(applicationsData);
      setError('');
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load courses and applications');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by institution
    if (filterInstitution) {
      filtered = filtered.filter(course => course.institutionId === filterInstitution);
    }

    // Filter by qualification status
    if (filterQualification === 'qualified') {
      filtered = filtered.filter(course => course.isQualified);
    } else if (filterQualification === 'not-qualified') {
      filtered = filtered.filter(course => !course.isQualified);
    }

    setFilteredCourses(filtered);
  };

  const getUniqueInstitutions = () => {
    const institutions = courses.reduce((acc, course) => {
      if (!acc.find(inst => inst.id === course.institutionId)) {
        acc.push({
          id: course.institutionId,
          name: course.institutionName
        });
      }
      return acc;
    }, []);
    return institutions;
  };

  const getApplicationsForInstitution = (institutionId) => {
    return myApplications.filter(app => 
      app.institutionId === institutionId && 
      (app.status === 'pending' || app.status === 'approved')
    );
  };

  const canApplyToCourse = (course) => {
    // Check if already applied to this course
    const alreadyApplied = myApplications.some(app => 
      app.courseId === course.id && (app.status === 'pending' || app.status === 'approved')
    );
    if (alreadyApplied) return false;

    // Check if reached max applications for this institution
    const institutionApplications = getApplicationsForInstitution(course.institutionId);
    return institutionApplications.length < 2;
  };

  const handleCourseSelect = (course) => {
    if (selectedCourses.some(c => c.id === course.id)) {
      // Deselect course
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } else {
      // Check if student is qualified
      if (!course.isQualified) {
        setError(`You cannot apply for ${course.name} because you don't meet the requirements.`);
        return;
      }

      // Check if can apply to more courses from this institution
      const institutionApplications = getApplicationsForInstitution(course.institutionId);
      const currentSelections = selectedCourses.filter(c => c.institutionId === course.institutionId);
      
      if (institutionApplications.length + currentSelections.length >= 2) {
        setError(`You can only apply for maximum 2 courses per institution. You have ${institutionApplications.length} existing applications.`);
        return;
      }

      setSelectedCourses([...selectedCourses, course]);
      setError('');
    }
  };

  const handleApply = async () => {
    if (selectedCourses.length === 0) {
      setError('Please select at least one course to apply for');
      return;
    }

    try {
      setApplying(true);
      setMessage('');
      setError('');

      const applicationPromises = selectedCourses.map(course =>
        studentService.applyForCourse({
          courseId: course.id,
          institutionId: course.institutionId
        })
      );

      const results = await Promise.allSettled(applicationPromises);

      const successfulApplications = results.filter(result => result.status === 'fulfilled').length;
      const failedApplications = results.filter(result => result.status === 'rejected');

      if (failedApplications.length > 0) {
        const errorMessages = failedApplications.map(failed => failed.reason.response?.data?.message || 'Application failed');
        setError(`Some applications failed: ${errorMessages.join(', ')}`);
      }

      if (successfulApplications > 0) {
        setMessage(`Successfully applied to ${successfulApplications} course(s)!`);
        setSelectedCourses([]);
        await loadData(); // Reload to reflect new applications
      }
      
    } catch (error) {
      console.error('Error applying for courses:', error);
      setError('Failed to submit applications: ' + (error.response?.data?.message || error.message));
    } finally {
      setApplying(false);
    }
  };

  const getCourseStatus = (courseId) => {
    const application = myApplications.find(app => app.courseId === courseId);
    if (application) {
      return {
        applied: true,
        status: application.status,
        applicationId: application.id
      };
    }
    return { applied: false, status: null };
  };

  const getInstitutionApplicationsCount = (institutionId) => {
    return getApplicationsForInstitution(institutionId).length;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading available courses...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Courses</h1>
        <p>Explore courses from all institutions and apply (maximum 2 courses per institution)</p>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Application Summary */}
      {selectedCourses.length > 0 && (
        <div className="application-summary">
          <h3>Selected Courses ({selectedCourses.length})</h3>
          <div className="selected-courses-list">
            {selectedCourses.map(course => (
              <div key={course.id} className="selected-course-item">
                <div className="course-info">
                  <strong>{course.name}</strong>
                  <span>{course.institutionName}</span>
                </div>
                <button 
                  onClick={() => handleCourseSelect(course)}
                  className="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={handleApply}
            disabled={applying}
            className="btn btn-primary"
          >
            {applying ? 'Submitting Applications...' : `Apply to ${selectedCourses.length} Course(s)`}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search courses or institutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select 
            value={filterInstitution}
            onChange={(e) => setFilterInstitution(e.target.value)}
            className="filter-select"
          >
            <option value="">All Institutions</option>
            {getUniqueInstitutions().map(institution => (
              <option key={institution.id} value={institution.id}>
                {institution.name} ({getInstitutionApplicationsCount(institution.id)}/2)
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            value={filterQualification}
            onChange={(e) => setFilterQualification(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            <option value="qualified">Qualified Only</option>
            <option value="not-qualified">Not Qualified</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-section">
        <h3>
          Available Courses ({filteredCourses.length})
          {filteredCourses.length !== courses.length && (
            <span className="filtered-count"> (filtered from {courses.length})</span>
          )}
        </h3>
        
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <p>No courses found matching your criteria.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map(course => {
              const courseStatus = getCourseStatus(course.id);
              const canApply = canApplyToCourse(course);
              const isSelected = selectedCourses.some(c => c.id === course.id);
              const institutionApplications = getApplicationsForInstitution(course.institutionId);

              return (
                <div key={course.id} className={`course-card ${!course.isQualified ? 'not-qualified' : ''}`}>
                  <div className="course-header">
                    <h4>{course.name}</h4>
                    <div className="course-status">
                      {courseStatus.applied && (
                        <span className={`status-badge status-${courseStatus.status}`}>
                          {courseStatus.status}
                        </span>
                      )}
                      {!course.isQualified && (
                        <span className="status-badge status-not-qualified">
                          Not Qualified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="course-details">
                    <p><strong>Institution:</strong> {course.institutionName}</p>
                    <p><strong>Faculty:</strong> {course.faculty}</p>
                    <p><strong>Duration:</strong> {course.duration}</p>
                    <p><strong>Description:</strong> {course.description}</p>
                    
                    {course.requirements && (
                      <div className="requirements-section">
                        <strong>Requirements:</strong>
                        <ul className="requirements-list">
                          {course.requirements.minEducationLevel && (
                            <li>Education: {course.requirements.minEducationLevel}</li>
                          )}
                          {course.requirements.minGPA && (
                            <li>Minimum GPA: {course.requirements.minGPA}</li>
                          )}
                          {course.requirements.requiredSubjects && (
                            <li>Subjects: {course.requirements.requiredSubjects.join(', ')}</li>
                          )}
                          {course.requirements.prerequisites && (
                            <li>Prerequisites: {course.requirements.prerequisites.join(', ')}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {!course.isQualified && course.qualificationReasons && (
                    <div className="qualification-warning">
                      <strong>Why you don't qualify:</strong>
                      <ul>
                        {course.qualificationReasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="course-actions">
                    {courseStatus.applied ? (
                      <button className="btn btn-outline" disabled>
                        Already Applied
                      </button>
                    ) : !course.isQualified ? (
                      <button className="btn btn-disabled" disabled>
                        Not Qualified
                      </button>
                    ) : !canApply ? (
                      <button className="btn btn-disabled" disabled>
                        Max Applications Reached
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCourseSelect(course)}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {isSelected ? 'Selected' : 'Select Course'}
                      </button>
                    )}
                  </div>

                  <div className="course-footer">
                    <small>
                      Institution applications: {institutionApplications.length}/2 used
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Applications Summary */}
      <div className="applications-summary">
        <h3>My Applications Summary</h3>
        {myApplications.length === 0 ? (
          <p>No applications submitted yet.</p>
        ) : (
          <div className="applications-list">
            {myApplications.map(application => (
              <div key={application.id} className="application-item">
                <div className="application-info">
                  <strong>{application.courseName}</strong>
                  <span>{application.institutionName}</span>
                  <small>Applied: {new Date(application.appliedAt?.toDate?.() || application.appliedAt).toLocaleDateString()}</small>
                </div>
                <span className={`status-badge status-${application.status}`}>
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseApplication;
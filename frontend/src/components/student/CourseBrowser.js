import React, { useState, useEffect } from 'react';
import { studentInstituteService } from '../../services/studentInstituteService';
import { useAuth } from '../../context/AuthContext';

const CourseBrowser = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [filters, setFilters] = useState({
    institutionId: '',
    faculty: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    loadCourses();
    loadFilters();
  }, [filters]);

  const loadCourses = async () => {
    try {
      const data = await studentInstituteService.getAvailableCourses(filters);
      setCourses(data.courses || []);
      setInstitutions(data.institutions || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    // Load available filters (institutions, faculties)
    const filtersData = await studentInstituteService.getAvailableCourses({});
    setFaculties(filtersData.faculties || []);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    try {
      const eligibilityCheck = await studentInstituteService.checkEligibility(course.id);
      setEligibility(eligibilityCheck);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const handleApply = async (courseId) => {
    if (!eligibility || !eligibility.isEligible) {
      alert('You are not eligible for this course. Please check the requirements.');
      return;
    }

    try {
      await studentInstituteService.applyForCourses([{ courseId }]);
      alert('Application submitted successfully!');
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error applying for course:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading available courses...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Courses</h1>
        <p>Explore courses from various institutions and apply for your preferred programs</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Institution</label>
          <select 
            value={filters.institutionId} 
            onChange={(e) => handleFilterChange('institutionId', e.target.value)}
          >
            <option value="">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Faculty</label>
          <select 
            value={filters.faculty} 
            onChange={(e) => handleFilterChange('faculty', e.target.value)}
          >
            <option value="">All Faculties</option>
            {faculties.map(faculty => (
              <option key={faculty} value={faculty}>{faculty}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search courses..."
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.name}</h3>
              <span className="institution-badge">{course.institutionName}</span>
            </div>
            
            <div className="course-details">
              <p className="faculty">{course.faculty}</p>
              <p className="duration">{course.duration}</p>
              <p className="fees">{course.fees}</p>
            </div>

            <div className="course-requirements">
              <strong>Requirements:</strong>
              <p>{course.requirements}</p>
            </div>

            <div className="course-actions">
              <button 
                className="btn btn-outline"
                onClick={() => handleCourseSelect(course)}
              >
                View Details
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleApply(course.id)}
                disabled={!eligibility?.isEligible}
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedCourse.name}</h2>
            <div className="course-detail">
              <p><strong>Institution:</strong> {selectedCourse.institutionName}</p>
              <p><strong>Faculty:</strong> {selectedCourse.faculty}</p>
              <p><strong>Duration:</strong> {selectedCourse.duration}</p>
              <p><strong>Fees:</strong> {selectedCourse.fees}</p>
              
              <div className="requirements-section">
                <h4>Admission Requirements</h4>
                <p>{selectedCourse.requirements}</p>
              </div>

              {eligibility && (
                <div className={`eligibility-status ${eligibility.isEligible ? 'eligible' : 'not-eligible'}`}>
                  <h4>Eligibility Status: {eligibility.isEligible ? 'Eligible' : 'Not Eligible'}</h4>
                  {eligibility.reasons && (
                    <ul>
                      {eligibility.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleApply(selectedCourse.id)}
                  disabled={!eligibility?.isEligible}
                >
                  Apply for Course
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedCourse(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBrowser;
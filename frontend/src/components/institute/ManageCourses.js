import React, { useState, useEffect } from 'react';
import { instituteService } from '../../services/instituteService';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facultyId: '',
    duration: '',
    fees: '',
    requirements: '',
    intakeCapacity: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, facultiesData] = await Promise.all([
        instituteService.getCourses(),
        instituteService.getFaculties()
      ]);
      setCourses(coursesData);
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await instituteService.updateCourse(editingCourse.id, formData);
      } else {
        await instituteService.addCourse(formData);
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ 
        name: '', description: '', facultyId: '', duration: '', 
        fees: '', requirements: '', intakeCapacity: '' 
      });
      loadData();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This will affect existing applications.')) {
      try {
        await instituteService.deleteCourse(id);
        loadData();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Courses and Programs</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingCourse(null);
            setFormData({ 
              name: '', description: '', facultyId: '', duration: '', 
              fees: '', requirements: '', intakeCapacity: '' 
            });
          }}
          disabled={faculties.length === 0}
        >
          Create New Course
        </button>
      </div>

      {faculties.length === 0 && (
        <div className="warning-message">
          <p>You need to create at least one faculty before adding courses.</p>
        </div>
      )}

      {showForm && (
        <div className="form-modal">
          <div className="modal-content">
            <h2>{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Faculty *</label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 4 years, 2 semesters"
                  />
                </div>

                <div className="form-group">
                  <label>Fees</label>
                  <input
                    type="text"
                    value={formData.fees}
                    onChange={(e) => setFormData({...formData, fees: e.target.value})}
                    placeholder="e.g., $10,000 per year"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Admission Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  rows="4"
                  placeholder="List the academic and other requirements for this course..."
                />
              </div>

              <div className="form-group">
                <label>Intake Capacity</label>
                <input
                  type="number"
                  value={formData.intakeCapacity}
                  onChange={(e) => setFormData({...formData, intakeCapacity: e.target.value})}
                  placeholder="Maximum number of students"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-section">
        <h2>Courses List</h2>
        <div className="courses-list">
          {courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses created yet. Create your first course to start receiving applications.</p>
            </div>
          ) : (
            courses.map((course) => {
              const faculty = faculties.find(f => f.id === course.facultyId);
              return (
                <div key={course.id} className="course-card">
                  <div className="course-info">
                    <h3>{course.name}</h3>
                    <p className="course-faculty">
                      Faculty: {faculty ? faculty.name : 'Unknown'}
                    </p>
                    {course.description && (
                      <p className="course-description">{course.description}</p>
                    )}
                    <div className="course-details">
                      {course.duration && <span>Duration: {course.duration}</span>}
                      {course.fees && <span>Fees: {course.fees}</span>}
                      {course.intakeCapacity && <span>Capacity: {course.intakeCapacity} students</span>}
                    </div>
                    {course.requirements && (
                      <div className="course-requirements">
                        <strong>Requirements:</strong> {course.requirements}
                      </div>
                    )}
                  </div>
                  <div className="course-actions">
                    <button 
                      className="btn btn-outline"
                      onClick={() => {
                        setEditingCourse(course);
                        setFormData({
                          name: course.name || '',
                          description: course.description || '',
                          facultyId: course.facultyId || '',
                          duration: course.duration || '',
                          fees: course.fees || '',
                          requirements: course.requirements || '',
                          intakeCapacity: course.intakeCapacity || ''
                        });
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;
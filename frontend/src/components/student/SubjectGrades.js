import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const SubjectGrades = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [subjectGrades, setSubjectGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [subjectsData, gradeOptionsData, profileData] = await Promise.all([
        studentService.getPopularSubjects(),
        studentService.getGradeOptions(),
        studentService.getProfile()
      ]);

      setSubjects(subjectsData);
      setGradeOptions(gradeOptionsData);
      
      // Initialize subject grades with existing data or empty values
      const initialGrades = {};
      subjectsData.forEach(subject => {
        initialGrades[subject] = profileData.subjectGrades?.[subject] || '';
      });
      setSubjectGrades(initialGrades);
      
      setError('');
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load subject data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []); // Removed loadStudentData from dependencies

  const handleGradeChange = (subject, grade) => {
    setSubjectGrades(prev => ({
      ...prev,
      [subject]: grade
    }));
  };

  const handleSaveGrades = async () => {
    try {
      setSaving(true);
      setMessage('');
      setError('');

      // Filter out empty grades
      const gradesToSave = Object.fromEntries(
        Object.entries(subjectGrades).filter(([_, grade]) => grade !== '')
      );

      await studentService.updateAcademicRecords({ subjectGrades: gradesToSave });
      setMessage('Subject grades saved successfully!');
    } catch (error) {
      console.error('Error saving grades:', error);
      setError('Failed to save subject grades');
    } finally {
      setSaving(false);
    }
  };

  const getCompletedSubjectsCount = () => {
    return Object.values(subjectGrades).filter(grade => grade !== '').length;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading subject data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Subject Grades</h1>
        <p>Enter your subject grades to see which courses you qualify for</p>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="subject-grades-container">
        <div className="grades-summary">
          <h3>Progress</h3>
          <p>
            {getCompletedSubjectsCount()} out of {subjects.length} subjects completed
          </p>
        </div>

        <div className="subjects-grid">
          {subjects.map(subject => (
            <div key={subject} className="subject-card">
              <label className="subject-label">{subject}</label>
              <select
                value={subjectGrades[subject] || ''}
                onChange={(e) => handleGradeChange(subject, e.target.value)}
                className="grade-select"
              >
                <option value="">Select Grade</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="actions-section">
          <button
            onClick={handleSaveGrades}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save All Grades'}
          </button>
          
          <button
            onClick={() => window.location.href = '/student/courses/qualified'}
            className="btn btn-success"
            disabled={getCompletedSubjectsCount() === 0}
          >
            View Qualified Courses
          </button>
        </div>

        <div className="help-section">
          <h4>How it works:</h4>
          <ul>
            <li>Enter your grades for each subject you've completed</li>
            <li>Save your grades to update your profile</li>
            <li>View courses you qualify for based on your grades</li>
            <li>Courses will automatically check your grades against their requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubjectGrades;
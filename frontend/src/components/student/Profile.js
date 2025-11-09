import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    educationLevel: '',
    academicRecords: {},
    subjectGrades: {},
    documents: {
      transcripts: [],
      certificates: [],
      identification: [],
      other: []
    },
    dateOfBirth: '',
    workExperience: 0,
    completedCourses: [],
    interests: [],
    skills: [],
    bio: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const profileData = await studentService.getProfile();
      
      // Ensure documents is properly structured
      const safeDocuments = {
        transcripts: Array.isArray(profileData.documents?.transcripts) ? profileData.documents.transcripts : [],
        certificates: Array.isArray(profileData.documents?.certificates) ? profileData.documents.certificates : [],
        identification: Array.isArray(profileData.documents?.identification) ? profileData.documents.identification : [],
        other: Array.isArray(profileData.documents?.other) ? profileData.documents.other : []
      };
      
      setProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        educationLevel: profileData.educationLevel || '',
        academicRecords: profileData.academicRecords || {},
        subjectGrades: profileData.subjectGrades || {},
        documents: safeDocuments,
        dateOfBirth: profileData.dateOfBirth || '',
        workExperience: profileData.workExperience || 0,
        completedCourses: Array.isArray(profileData.completedCourses) ? profileData.completedCourses : [],
        interests: Array.isArray(profileData.interests) ? profileData.interests : [],
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        bio: profileData.bio || '',
        address: profileData.address || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, child, value) => {
    setProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const handleDocumentChange = (docType, value) => {
    setProfile(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Prepare update data
      const updateData = {
        name: profile.name,
        phone: profile.phone,
        educationLevel: profile.educationLevel,
        academicRecords: profile.academicRecords,
        subjectGrades: profile.subjectGrades,
        documents: profile.documents,
        dateOfBirth: profile.dateOfBirth,
        workExperience: profile.workExperience,
        completedCourses: profile.completedCourses,
        interests: profile.interests,
        skills: profile.skills,
        bio: profile.bio,
        address: profile.address
      };

      await studentService.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      
      // Update auth context
      if (user) {
        user.name = profile.name;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Update your personal information and academic records</p>
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
      
      <div className="profile-container">
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={true} // Email should be read-only
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="educationLevel">Education Level</label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  value={profile.educationLevel}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={saving}
                >
                  <option value="">Select Education Level</option>
                  <option value="high_school">High School</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="workExperience">Work Experience (Years)</label>
                <input
                  type="number"
                  id="workExperience"
                  name="workExperience"
                  value={profile.workExperience}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="form-control"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
          
          {/* Academic Records */}
          <div className="form-section">
            <h3>Academic Records</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="gpa">GPA</label>
                <input
                  type="number"
                  id="gpa"
                  name="gpa"
                  value={profile.academicRecords?.gpa || ''}
                  onChange={(e) => handleNestedChange('academicRecords', 'gpa', parseFloat(e.target.value))}
                  min="0"
                  max="4"
                  step="0.01"
                  className="form-control"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="major">Major/Field of Study</label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  value={profile.academicRecords?.major || ''}
                  onChange={(e) => handleNestedChange('academicRecords', 'major', e.target.value)}
                  className="form-control"
                  placeholder="e.g., Computer Science, Business Administration"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
          
          {/* Subject Grades */}
          <div className="form-section">
            <h3>Subject Grades</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="mathematics">Mathematics</label>
                <select
                  id="mathematics"
                  name="mathematics"
                  value={profile.subjectGrades?.Mathematics || ''}
                  onChange={(e) => handleNestedChange('subjectGrades', 'Mathematics', e.target.value)}
                  className="form-control"
                  disabled={saving}
                >
                  <option value="">Select Grade</option>
                  <option value="A*">A*</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="english">English</label>
                <select
                  id="english"
                  name="english"
                  value={profile.subjectGrades?.English || ''}
                  onChange={(e) => handleNestedChange('subjectGrades', 'English', e.target.value)}
                  className="form-control"
                  disabled={saving}
                >
                  <option value="">Select Grade</option>
                  <option value="A*">A*</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="physics">Physics</label>
                <select
                  id="physics"
                  name="physics"
                  value={profile.subjectGrades?.Physics || ''}
                  onChange={(e) => handleNestedChange('subjectGrades', 'Physics', e.target.value)}
                  className="form-control"
                  disabled={saving}
                >
                  <option value="">Select Grade</option>
                  <option value="A*">A*</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="chemistry">Chemistry</label>
                <select
                  id="chemistry"
                  name="chemistry"
                  value={profile.subjectGrades?.Chemistry || ''}
                  onChange={(e) => handleNestedChange('subjectGrades', 'Chemistry', e.target.value)}
                  className="form-control"
                  disabled={saving}
                >
                  <option value="">Select Grade</option>
                  <option value="A*">A*</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="form-section">
            <h3>Uploaded Documents</h3>
            <div className="documents-grid">
              <div className="document-category">
                <h4>Academic Transcripts</h4>
                <div className="document-list">
                  {Array.isArray(profile.documents?.transcripts) && profile.documents.transcripts.length > 0 ? (
                    profile.documents.transcripts.map((doc, index) => (
                      <div key={doc.id || index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-status">{doc.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No transcripts uploaded</p>
                  )}
                </div>
              </div>
              <div className="document-category">
                <h4>Certificates</h4>
                <div className="document-list">
                  {Array.isArray(profile.documents?.certificates) && profile.documents.certificates.length > 0 ? (
                    profile.documents.certificates.map((doc, index) => (
                      <div key={doc.id || index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-status">{doc.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No certificates uploaded</p>
                  )}
                </div>
              </div>
              <div className="document-category">
                <h4>Identification</h4>
                <div className="document-list">
                  {Array.isArray(profile.documents?.identification) && profile.documents.identification.length > 0 ? (
                    profile.documents.identification.map((doc, index) => (
                      <div key={doc.id || index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-status">{doc.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No identification documents uploaded</p>
                  )}
                </div>
              </div>
              <div className="document-category">
                <h4>Other Documents</h4>
                <div className="document-list">
                  {Array.isArray(profile.documents?.other) && profile.documents.other.length > 0 ? (
                    profile.documents.other.map((doc, index) => (
                      <div key={doc.id || index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-status">{doc.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No other documents uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label htmlFor="bio">Biography</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows="4"
                className="form-control"
                placeholder="Tell us about yourself, your interests, and career goals..."
                maxLength="500"
                disabled={saving}
              />
              <small>{profile.bio.length}/500 characters</small>
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                rows="3"
                className="form-control"
                placeholder="Enter your complete address..."
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label htmlFor="skills">Skills</label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={Array.isArray(profile.skills) ? profile.skills.join(', ') : ''}
                onChange={(e) => handleInputChange({ target: { name: 'skills', value: e.target.value.split(',').map(s => s.trim()).filter(s => s) } })}
                className="form-control"
                placeholder="e.g., JavaScript, React, Python, Leadership"
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label htmlFor="interests">Interests</label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={Array.isArray(profile.interests) ? profile.interests.join(', ') : ''}
                onChange={(e) => handleInputChange({ target: { name: 'interests', value: e.target.value.split(',').map(i => i.trim()).filter(i => i) } })}
                className="form-control"
                placeholder="e.g., Programming, Marketing, Research, Sports"
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label htmlFor="completedCourses">Completed Courses</label>
              <input
                type="text"
                id="completedCourses"
                name="completedCourses"
                value={Array.isArray(profile.completedCourses) ? profile.completedCourses.join(', ') : ''}
                onChange={(e) => handleInputChange({ target: { name: 'completedCourses', value: e.target.value.split(',').map(c => c.trim()).filter(c => c) } })}
                className="form-control"
                placeholder="e.g., Introduction to Programming, Business Fundamentals"
                disabled={saving}
              />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={loadProfile}
              disabled={saving}
            >
              Discard Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
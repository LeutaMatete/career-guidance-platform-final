import React, { useState, useEffect } from 'react';
import { instituteService } from '../../services/instituteService';
import { useAuth } from '../../context/AuthContext';

const InstituteProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    website: '',
    address: '',
    established: '',
    type: '',
    accreditation: '',
    contactPerson: '',
    contactPosition: '',
    documents: {
      accreditation: [],
      certificates: [],
      other: []
    }
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
      const profileData = await instituteService.getProfile();
      
      // Ensure documents is properly structured
      const safeDocuments = {
        accreditation: Array.isArray(profileData.documents?.accreditation) ? profileData.documents.accreditation : [],
        certificates: Array.isArray(profileData.documents?.certificates) ? profileData.documents.certificates : [],
        other: Array.isArray(profileData.documents?.other) ? profileData.documents.other : []
      };
      
      setProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        description: profileData.description || '',
        website: profileData.website || '',
        address: profileData.address || '',
        established: profileData.established || '',
        type: profileData.type || '',
        accreditation: profileData.accreditation || '',
        contactPerson: profileData.contactPerson || '',
        contactPosition: profileData.contactPosition || '',
        documents: safeDocuments
      });
    } catch (error) {
      console.error('Error loading institute profile:', error);
      setError('Failed to load institute profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await instituteService.updateProfile(profile);
      setSuccess('Institute profile updated successfully!');
      
      // Update auth context
      if (user) {
        user.name = profile.name;
      }
    } catch (error) {
      console.error('Error updating institute profile:', error);
      setError('Failed to update institute profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading institute profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Institution Profile</h1>
        <p>Update your institution information and details</p>
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
          {/* Institution Information */}
          <div className="form-section">
            <h3>Institution Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Institution Name *</label>
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
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={profile.website}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="https://"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Institution Type</label>
                <select
                  id="type"
                  name="type"
                  value={profile.type}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={saving}
                >
                  <option value="">Select Type</option>
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="technical">Technical School</option>
                  <option value="polytechnic">Polytechnic</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="established">Established Year</label>
                <input
                  type="number"
                  id="established"
                  name="established"
                  value={profile.established}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="form-control"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="accreditation">Accreditation</label>
                <input
                  type="text"
                  id="accreditation"
                  name="accreditation"
                  value={profile.accreditation}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., National Accreditation Council"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
          
          {/* Contact Person */}
          <div className="form-section">
            <h3>Contact Person</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={profile.contactPerson}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Full name of contact person"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactPosition">Position</label>
                <input
                  type="text"
                  id="contactPosition"
                  name="contactPosition"
                  value={profile.contactPosition}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., Dean, Registrar"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
          
          {/* Institution Description */}
          <div className="form-section">
            <h3>Institution Description</h3>
            <div className="form-group">
              <label htmlFor="description">About Your Institution</label>
              <textarea
                id="description"
                name="description"
                value={profile.description}
                onChange={handleInputChange}
                rows="6"
                className="form-control"
                placeholder="Describe your institution's mission, values, programs, and what makes you unique..."
                disabled={saving}
              />
            </div>
          </div>
          
          {/* Address */}
          <div className="form-section">
            <h3>Institution Address</h3>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                rows="3"
                className="form-control"
                placeholder="Street address, city, country..."
                disabled={saving}
              />
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="form-section">
            <h3>Institution Documents</h3>
            <div className="documents-grid">
              <div className="document-category">
                <h4>Accreditation Documents</h4>
                <div className="document-list">
                  {Array.isArray(profile.documents?.accreditation) && profile.documents.accreditation.length > 0 ? (
                    profile.documents.accreditation.map((doc, index) => (
                      <div key={doc.id || index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-status">{doc.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No accreditation documents uploaded</p>
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

export default InstituteProfile;
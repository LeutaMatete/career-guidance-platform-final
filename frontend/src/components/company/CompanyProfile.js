import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    industry: '',
    website: '',
    address: '',
    size: '',
    founded: '',
    contactPerson: '',
    contactPosition: '',
    documents: {
      certificates: [],
      licenses: [],
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
      const profileData = await companyService.getProfile();
      
      // Ensure documents is properly structured
      const safeDocuments = {
        certificates: Array.isArray(profileData.documents?.certificates) ? profileData.documents.certificates : [],
        licenses: Array.isArray(profileData.documents?.licenses) ? profileData.documents.licenses : [],
        other: Array.isArray(profileData.documents?.other) ? profileData.documents.other : []
      };
      
      setProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        description: profileData.description || '',
        industry: profileData.industry || '',
        website: profileData.website || '',
        address: profileData.address || '',
        size: profileData.size || '',
        founded: profileData.founded || '',
        contactPerson: profileData.contactPerson || '',
        contactPosition: profileData.contactPosition || '',
        documents: safeDocuments
      });
    } catch (error) {
      console.error('Error loading company profile:', error);
      setError('Failed to load company profile');
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
      
      await companyService.updateProfile(profile);
      setSuccess('Company profile updated successfully!');
      
      // Update auth context
      if (user) {
        user.name = profile.name;
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      setError('Failed to update company profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading company profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Company Profile</h1>
        <p>Update your company information and details</p>
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
          {/* Company Information */}
          <div className="form-section">
            <h3>Company Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Company Name *</label>
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
                <label htmlFor="industry">Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={profile.industry}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., Technology, Healthcare, Finance"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="size">Company Size</label>
                <select
                  id="size"
                  name="size"
                  value={profile.size}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={saving}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="founded">Founded Year</label>
                <input
                  type="number"
                  id="founded"
                  name="founded"
                  value={profile.founded}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="form-control"
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
                  placeholder="e.g., HR Manager, CEO"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
          
          {/* Company Description */}
          <div className="form-section">
            <h3>Company Description</h3>
            <div className="form-group">
              <label htmlFor="description">About Your Company</label>
              <textarea
                id="description"
                name="description"
                value={profile.description}
                onChange={handleInputChange}
                rows="6"
                className="form-control"
                placeholder="Describe your company's mission, values, culture, and what makes you unique..."
                disabled={saving}
              />
            </div>
          </div>
          
          {/* Address */}
          <div className="form-section">
            <h3>Company Address</h3>
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
            <h3>Company Documents</h3>
            <div className="documents-grid">
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
                <h4>Licenses</h4>
                <div className="document-list">
                  {Array.isArray(profile.documents?.licenses) && profile.documents.licenses.length > 0 ? (
                    profile.documents.licenses.map((doc, index) => (
                      <div key={doc.id || index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-status">{doc.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No licenses uploaded</p>
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

export default CompanyProfile;
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getInstitutions();
      setInstitutions(data);
      setError('');
    } catch (error) {
      console.error('Error loading institutions:', error);
      setError('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstitution) {
        await adminService.updateInstitution(editingInstitution.id, formData);
      } else {
        await adminService.addInstitution(formData);
      }
      setShowAddForm(false);
      setEditingInstitution(null);
      setFormData({ name: '', email: '', phone: '', address: '', website: '', description: '' });
      await loadInstitutions();
      setError('');
    } catch (error) {
      console.error('Error saving institution:', error);
      setError('Failed to save institution');
    }
  };

  const handleEdit = (institution) => {
    setEditingInstitution(institution);
    setFormData({
      name: institution.name || '',
      email: institution.email || '',
      phone: institution.phone || '',
      address: institution.address || '',
      website: institution.website || '',
      description: institution.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await adminService.deleteInstitution(id);
        await loadInstitutions();
        setError('');
      } catch (error) {
        console.error('Error deleting institution:', error);
        setError('Failed to delete institution');
      }
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingInstitution(null);
    setFormData({ name: '', email: '', phone: '', address: '', website: '', description: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading institutions...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Institutions</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setEditingInstitution(null);
            setFormData({ name: '', email: '', phone: '', address: '', website: '', description: '' });
          }}
        >
          Add New Institution
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="form-modal">
          <div className="modal-content">
            <h2>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Institution Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingInstitution ? 'Update Institution' : 'Add Institution'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="institutions-list">
        {institutions.length === 0 ? (
          <div className="empty-state">
            <p>No institutions found.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              Add Your First Institution
            </button>
          </div>
        ) : (
          institutions.map((institution) => (
            <div key={institution.id} className="institution-card">
              <div className="institution-info">
                <h3>{institution.name}</h3>
                {institution.email && <p><strong>Email:</strong> {institution.email}</p>}
                {institution.phone && <p><strong>Phone:</strong> {institution.phone}</p>}
                {institution.address && <p className="institution-address"><strong>Address:</strong> {institution.address}</p>}
                {institution.website && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={institution.website} target="_blank" rel="noopener noreferrer">
                      {institution.website}
                    </a>
                  </p>
                )}
                {institution.description && (
                  <p className="institution-description"><strong>Description:</strong> {institution.description}</p>
                )}
                <p><strong>Created:</strong> {new Date(institution.createdAt?.toDate?.() || institution.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {institution.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="institution-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => handleEdit(institution)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(institution.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageInstitutions;
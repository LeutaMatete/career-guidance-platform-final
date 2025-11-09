import React, { useState, useEffect } from 'react';
import { instituteService } from '../../services/instituteService';

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentCode: ''
  });

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      const data = await instituteService.getFaculties();
      setFaculties(data);
    } catch (error) {
      console.error('Error loading faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await instituteService.updateFaculty(editingFaculty.id, formData);
      } else {
        await instituteService.addFaculty(formData);
      }
      setShowForm(false);
      setEditingFaculty(null);
      setFormData({ name: '', description: '', departmentCode: '' });
      loadFaculties();
    } catch (error) {
      console.error('Error saving faculty:', error);
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name || '',
      description: faculty.description || '',
      departmentCode: faculty.departmentCode || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty? This action cannot be undone.')) {
      try {
        await instituteService.deleteFaculty(id);
        loadFaculties();
      } catch (error) {
        console.error('Error deleting faculty:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading faculties...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Faculties and Departments</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingFaculty(null);
            setFormData({ name: '', description: '', departmentCode: '' });
          }}
        >
          Add New Faculty
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="modal-content">
            <h2>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Faculty Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department Code</label>
                <input
                  type="text"
                  value={formData.departmentCode}
                  onChange={(e) => setFormData({...formData, departmentCode: e.target.value})}
                  placeholder="e.g., CS, ENG, BUS"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Describe this faculty or department..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
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
        <h2>Faculties List</h2>
        <div className="faculties-list">
          {faculties.length === 0 ? (
            <div className="empty-state">
              <p>No faculties created yet. Add your first faculty to get started.</p>
            </div>
          ) : (
            faculties.map((faculty) => (
              <div key={faculty.id} className="faculty-card">
                <div className="faculty-info">
                  <h3>{faculty.name}</h3>
                  {faculty.departmentCode && (
                    <p className="department-code">Code: {faculty.departmentCode}</p>
                  )}
                  {faculty.description && (
                    <p className="faculty-description">{faculty.description}</p>
                  )}
                  <p className="created-date">
                    Created: {new Date(faculty.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="faculty-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleEdit(faculty)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(faculty.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFaculties;
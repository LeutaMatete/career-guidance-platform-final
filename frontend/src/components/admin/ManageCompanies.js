import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, filterStatus]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await adminService.getCompanies();
      setCompanies(companiesData);
      setError('');
    } catch (error) {
      console.error('Error loading companies:', error);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    if (filterStatus === 'all') {
      setFilteredCompanies(companies);
    } else {
      setFilteredCompanies(companies.filter(company => company.status === filterStatus));
    }
  };

  const handleStatusChange = async (companyId, newStatus) => {
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      await adminService.updateCompanyStatus(companyId, newStatus);
      
      setSuccess(`Company status updated to ${newStatus}`);
      
      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId ? { ...company, status: newStatus } : company
      ));
      
    } catch (error) {
      console.error('Error updating company status:', error);
      setError('Failed to update company status: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedCompanies.length === 0) {
      setError('Please select at least one company');
      return;
    }

    if (!window.confirm(`Are you sure you want to set ${selectedCompanies.length} companies to ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      await adminService.bulkUpdateCompanyStatus(selectedCompanies, newStatus);
      
      setSuccess(`Updated ${selectedCompanies.length} companies to ${newStatus}`);
      
      // Reload companies to reflect changes
      await loadCompanies();
      setSelectedCompanies([]);
      
    } catch (error) {
      console.error('Error updating company statuses:', error);
      setError('Failed to update company statuses: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectCompany = (companyId) => {
    if (selectedCompanies.includes(companyId)) {
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
    } else {
      setSelectedCompanies([...selectedCompanies, companyId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies.map(company => company.id));
    }
  };

  const getStatusStats = () => {
    const total = companies.length;
    const active = companies.filter(c => c.status === 'active').length;
    const pending = companies.filter(c => c.status === 'pending').length;
    const suspended = companies.filter(c => c.status === 'suspended').length;

    return { total, active, pending, suspended };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading companies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Companies</h1>
        <p>Review and manage company account status</p>
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

      {/* Statistics */}
      <div className="stats-overview">
        <h3>Company Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <h4>Total Companies</h4>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-content">
              <h4>Active</h4>
              <p className="stat-number">{stats.active}</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-content">
              <h4>Pending</h4>
              <p className="stat-number">{stats.pending}</p>
            </div>
          </div>
          <div className="stat-card suspended">
            <div className="stat-content">
              <h4>Suspended</h4>
              <p className="stat-number">{stats.suspended}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCompanies.length > 0 && (
        <div className="bulk-actions">
          <h3>Bulk Actions ({selectedCompanies.length} selected)</h3>
          <div className="action-buttons">
            <button 
              onClick={() => handleBulkStatusChange('active')}
              disabled={updating}
              className="btn btn-success"
            >
              Activate Selected
            </button>
            <button 
              onClick={() => handleBulkStatusChange('suspended')}
              disabled={updating}
              className="btn btn-warning"
            >
              Suspend Selected
            </button>
            <button 
              onClick={() => setSelectedCompanies([])}
              className="btn btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="filter-group">
          <button 
            onClick={loadCompanies}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="companies-section">
        <h3>
          Companies ({filteredCompanies.length})
          {filteredCompanies.length !== companies.length && (
            <span className="filtered-count"> (filtered from {companies.length})</span>
          )}
        </h3>

        {filteredCompanies.length === 0 ? (
          <div className="empty-state">
            <p>No companies found matching your criteria.</p>
          </div>
        ) : (
          <div className="companies-table">
            <div className="table-header">
              <div className="table-cell select-cell">
                <input
                  type="checkbox"
                  checked={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="table-cell">Company Name</div>
              <div className="table-cell">Contact Person</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Phone</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Created</div>
              <div className="table-cell">Actions</div>
            </div>

            {filteredCompanies.map(company => (
              <div key={company.id} className="table-row">
                <div className="table-cell select-cell">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.id)}
                    onChange={() => handleSelectCompany(company.id)}
                  />
                </div>
                <div className="table-cell">
                  <strong>{company.name}</strong>
                  {company.description && (
                    <div className="company-description">{company.description}</div>
                  )}
                </div>
                <div className="table-cell">
                  {company.contactPerson || 'Not specified'}
                </div>
                <div className="table-cell">
                  {company.email}
                </div>
                <div className="table-cell">
                  {company.phone || 'Not specified'}
                </div>
                <div className="table-cell">
                  <span className={`status-badge status-${company.status}`}>
                    {company.status}
                  </span>
                </div>
                <div className="table-cell">
                  {company.createdAt ? new Date(company.createdAt?.toDate?.() || company.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    {company.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusChange(company.id, 'active')}
                        disabled={updating}
                        className="btn btn-success"
                      >
                        Activate
                      </button>
                    )}
                    
                    {company.status === 'active' && (
                      <button 
                        onClick={() => handleStatusChange(company.id, 'suspended')}
                        disabled={updating}
                        className="btn btn-warning"
                      >
                        Suspend
                      </button>
                    )}
                    
                    {company.status === 'suspended' && (
                      <button 
                        onClick={() => handleStatusChange(company.id, 'active')}
                        disabled={updating}
                        className="btn btn-success"
                      >
                        Reactivate
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleStatusChange(company.id, 'pending')}
                      disabled={updating}
                      className="btn btn-outline"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCompanies;
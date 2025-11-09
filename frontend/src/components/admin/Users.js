import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, isApproved: newStatus === 'approved', isSuspended: newStatus === 'suspended' } : u));
      setMessage('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setMessage('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Failed to delete user');
    }
  };

  const getStatusBadge = (user) => {
    if (user.role === 'admin') return <span className="badge admin">Admin</span>;
    if (user.role === 'company' && !user.isApproved) return <span className="badge pending">Pending</span>;
    if (user.isSuspended) return <span className="badge suspended">Suspended</span>;
    return <span className="badge active">Active</span>;
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filter === 'all' || user.role === filter;
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
                          user.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Monitor and manage all registered users in the system</p>
      </div>
      
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Controls */}
      <div className="controls-section">
        <div className="filter-group">
          <label>Filter by Role:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="institute">Institutions</option>
            <option value="company">Companies</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No users found</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>{getStatusBadge(user)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.role === 'company' && (
                      <>
                        {!user.isApproved && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(user.id, 'approved')}
                          >
                            Approve
                          </button>
                        )}
                        {!user.isSuspended && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                          >
                            Suspend
                          </button>
                        )}
                        {user.isSuspended && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(user.id, 'approved')}
                          >
                            Activate
                          </button>
                        )}
                      </>
                    )}
                    {user.role !== 'admin' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    institutions: 0,
    companies: 0,
    pendingApprovals: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, institutions, companies, reports] = await Promise.all([
        adminService.getUsers(),
        adminService.getInstitutions(),
        adminService.getCompanies(),
        adminService.getSystemReports()
      ]);
      setStats({
        totalUsers: users.length,
        institutions: institutions.length,
        companies: companies.length,
        pendingApprovals: companies.filter(c => !c.isApproved).length,
        totalApplications: reports.applicationStats.total
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Platform activity overview & management tools</p>
      </header>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <a href="/admin/users" className="btn-link">Manage Users</a>
          </div>
          <div className="stat-card">
            <h3>Institutions</h3>
            <p className="stat-value">{stats.institutions}</p>
            <a href="/admin/institutions" className="btn-link">Manage Institutions</a>
          </div>
          <div className="stat-card">
            <h3>Companies</h3>
            <p className="stat-value">{stats.companies}</p>
            <a href="/admin/companies" className="btn-link">Manage Companies</a>
          </div>
          <div className="stat-card">
            <h3>Pending Approvals</h3>
            <p className="stat-value">{stats.pendingApprovals}</p>
            <a href="/admin/companies" className="btn-link">Review Approvals</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

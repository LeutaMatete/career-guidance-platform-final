import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Common navigation items for all roles
  const commonNavItems = [
    { path: '/', label: 'Home', show: true },
    { path: '/dashboard', label: 'Dashboard', show: !!user }
  ];

  // Role-specific navigation items
  const getRoleSpecificNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { path: '/student/courses', label: 'Browse Courses' },
          { path: '/student/jobs', label: 'Job Opportunities' },
          { path: '/student/applications', label: 'My Applications' },
          { path: '/student/admissions', label: 'Admission Results' },
          { path: '/student/profile', label: 'My Profile' }
        ];
      
      case 'institute':
        return [
          { path: '/institute/courses', label: 'Manage Courses' },
          { path: '/institute/faculties', label: 'Faculties' },
          { path: '/institute/applications', label: 'Applications' },
          { path: '/institute/admissions', label: 'Publish Admissions' },
          { path: '/institute/profile', label: 'Institute Profile' },
          { path: '/institute/analytics', label: 'Analytics' }
        ];
      
      case 'company':
        return [
          { path: '/company/jobs', label: 'Manage Jobs' },
          { path: '/company/jobs/post', label: 'Post Job' },
          { path: '/company/applicants', label: 'Applicants' },
          { path: '/company/profile', label: 'Company Profile' },
          { path: '/company/analytics', label: 'Analytics' }
        ];
      case 'admin':
        return [
          { path: '/admin/institutions', label: 'Institutions' },
          { path: '/admin/companies', label: 'Companies' },
          { path: '/admin/users', label: 'Users' },
          { path: '/admin/reports', label: 'Reports' },
          { path: '/admin/system', label: 'System Settings' }
        ];
      
      default:
        return [];
    }
  };

  const getRoleDisplayName = () => {
    const roleMap = {
      'student': 'Student',
      'institute': 'Institute',
      'company': 'Company',
      'admin': 'Administrator'
    };
    return roleMap[user?.role] || 'User';
  };

  const getRoleColor = () => {
    const colorMap = {
      'student': '#3b82f6', // Blue
      'institute': '#10b981', // Green
      'company': '#f59e0b', // Amber
      'admin': '#ef4444' // Red
    };
    return colorMap[user?.role] || '#6b7280';
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation for logged-out users
  if (!user) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            Career Guidance Platform
          </Link>
          
          <div className="nav-menu">
            <Link 
              to="/" 
              className={`nav-link ${isActivePath('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/login" 
              className="nav-link"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="nav-link btn-register"
            >
              Register
            </Link>
          </div>

          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile menu for logged-out users */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActivePath('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              to="/login" 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="mobile-nav-link btn-register"
              onClick={closeMobileMenu}
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    );
  }

  // Navigation for logged-in users
  const roleSpecificItems = getRoleSpecificNavItems();
  const roleColor = getRoleColor();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo" onClick={closeMobileMenu}>
          Career Guidance
          <span className="role-badge" style={{ backgroundColor: roleColor }}>
            {getRoleDisplayName()}
          </span>
        </Link>
        
        <div className="nav-menu">
          {/* Common navigation */}
          <Link 
            to="/" 
            className={`nav-link ${isActivePath('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActivePath('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>

          {/* Role-specific navigation */}
          {roleSpecificItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}

          {/* User menu */}
          <div className="nav-user-menu">
            <div className="user-info">
              <span className="user-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role" style={{ color: roleColor }}>
                  {getRoleDisplayName()}
                </span>
              </div>
            </div>
            <div className="user-dropdown">
              <Link 
                to={`/${user.role}/profile`} 
                className="dropdown-item"
                onClick={closeMobileMenu}
              >

              </Link>
              <Link 
                to="/settings" 
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button 
                onClick={handleLogout}
                className="dropdown-item logout-btn"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu for logged-in users */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-user-info">
            <span className="user-avatar large">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role" style={{ color: roleColor }}>
                {getRoleDisplayName()}
              </span>
            </div>
          </div>

          <Link 
            to="/" 
            className={`mobile-nav-link ${isActivePath('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          
          <Link 
            to="/dashboard" 
            className={`mobile-nav-link ${isActivePath('/dashboard') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>

          {roleSpecificItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActivePath(item.path) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}

          <div className="mobile-nav-divider"></div>

          <Link 
            to={`/${user.role}/profile`} 
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            My Profile
          </Link>
          
          <Link 
            to="/settings" 
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Settings
          </Link>

          <button 
            onClick={handleLogout}
            className="mobile-nav-link logout-btn"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
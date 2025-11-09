import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Added navigate
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await authService.resetPassword(token, formData.newPassword);
      setSuccess('Password reset successfully! You can now login with your new password.');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="page-container">
        <div className="form-container">
          <div className="form-header">
            <h1>Invalid Reset Link</h1>
            <p>No reset token found in the URL. Please use the link from your email.</p>
          </div>
          <button 
            className="btn btn-primary w-100"
            onClick={() => navigate('/forgot-password')}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <div className="form-header">
          <h1>Reset Password</h1>
          <p>Create a new password for your account</p>
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
        
        {!success ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter new password"
                minLength="6"
              />
              <small>Password must be at least 6 characters long</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Confirm new password"
                minLength="6"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <p>Password reset successfully!</p>
            <button 
              className="btn btn-primary w-100"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        )}
        
        <div className="form-footer">
          <p>
            Remember your password? 
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="btn-link"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
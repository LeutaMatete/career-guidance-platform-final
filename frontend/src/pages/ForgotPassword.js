import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSuccess('Password reset instructions have been sent to your email. Please check your inbox.');
      setEmail('');
    } catch (error) {
      console.error('Error sending reset email:', error);
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <div className="form-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive password reset instructions</p>
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
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
              placeholder="Enter your email address"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Sending Reset Email...' : 'Send Reset Instructions'}
          </button>
        </form>
        
        <div className="form-footer">
          <p>
            Remember your password? <Link to="/login" className="btn-link">Login here</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register" className="btn-link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
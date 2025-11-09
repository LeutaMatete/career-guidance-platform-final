import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService'; // Fixed path

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setLoading(false);
      setError('No verification token provided');
    }
  }, [token]); // Added verifyEmail to dependency array

  const verifyEmail = async () => {
    try {
      await authService.verifyEmail(token);
      setSuccess('Email verified successfully! You can now login.');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address to resend verification:');
    if (email) {
      try {
        setLoading(true);
        await authService.resendVerification(email);
        setError('');
        setSuccess('Verification email sent successfully!');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to resend verification email');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Verifying your email...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Email Verification</h1>
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
      <div className="verification-content">
        <div className="verification-actions">
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Go to Login
          </button>
          <button 
            onClick={handleResendVerification}
            className="btn btn-outline"
            disabled={loading}
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
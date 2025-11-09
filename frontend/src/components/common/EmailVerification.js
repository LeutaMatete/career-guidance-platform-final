import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setLoading(false);
      setError('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/confirm-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully! Your account is now active.');
      } else {
        setError(data.message || 'Email verification failed');
      }
    } catch (error) {
      setError('Email verification failed');
    } finally {
      setLoading(false);
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
      <div className="form-container">
        <div className="form-header">
          <h1>Email Verification</h1>
          <p>Confirm your email address</p>
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
          {success ? (
            <div className="success-content">
              <p>Your email has been verified successfully.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Continue to Login
              </button>
            </div>
          ) : (
            <div className="failure-content">
              <p>Email verification failed. The token may be invalid or expired.</p>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/register')}
              >
                Go to Registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
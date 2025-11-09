import api from './api';

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Store token and user in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

// Forgot password
 forgotPassword: async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error sending forgot password request:', error);
    throw error;
  }
},
  // Reset password
  resetPassword: async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
},
  // Verify email
  
verifyEmail: async (email) => {
  try {
    const response = await api.post('/auth/verify-email', { email });
    return response.data;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
},

  // Confirm email verification
  confirmEmailVerification: async (token) => {
    const response = await api.post('/auth/confirm-verification', { token });
    return response.data;
  },
// Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  },
  checkAdminExists: async () => {
    try {
      const response = await api.get('/auth/check-admin');
      return response.data;
    } catch (error) {
      console.error('Check admin error:', error);
      throw error;
    }
  }
};
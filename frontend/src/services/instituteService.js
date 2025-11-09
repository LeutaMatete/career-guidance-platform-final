import api from './api';

export const instituteService = {
  // Profile Management
  getProfile: async () => {
    const response = await api.get('/institute/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/institute/profile', profileData);
    return response.data;
  },

  // Faculty Management
  getFaculties: async () => {
    const response = await api.get('/institute/faculties');
    return response.data;
  },

  addFaculty: async (facultyData) => {
    const response = await api.post('/institute/faculties', facultyData);
    return response.data;
  },

  updateFaculty: async (facultyId, facultyData) => {
    const response = await api.put(`/institute/faculties/${facultyId}`, facultyData);
    return response.data;
  },

  deleteFaculty: async (facultyId) => {
    const response = await api.delete(`/institute/faculties/${facultyId}`);
    return response.data;
  },

  // Course Management
  getCourses: async () => {
    try {
      const response = await api.get('/institute/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  addCourse: async (courseData) => {
    const response = await api.post('/institute/courses', courseData);
    return response.data;
  },

  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/institute/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/institute/courses/${courseId}`);
    return response.data;
  },

// Update application status (approve/reject)
updateApplicationStatus: async (applicationId, status) => {
  try {
    const response = await api.put(`/institute/applications/${applicationId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
},

publishResults: async (courseId, resultsData) => {
  try {
    const response = await api.post('/institute/publish-results', {
      courseId,
      results: resultsData // Array of { studentId, status, ... }
    });
    return response.data;
  } catch (error) {
    console.error('Error publishing results via service:', error);
    // Attempt to get error message from response
    const errorMessage = error.response?.data?.message || 'Failed to publish results';
    throw new Error(errorMessage);
  }
},

publishResults: async (courseId, resultsData) => {
  try {
    const response = await api.post('/institute/publish-results', {
      courseId,
      results: resultsData // Array of { studentId, status, score? }
    });
    return response.data;
  } catch (error) {
    console.error('Error publishing results via service:', error);
    // Attempt to get error message from response
    const errorMessage = error.response?.data?.message || 'Failed to publish results';
    throw new Error(errorMessage);
  }
},

  // Application Management
  getApplications: async () => {
    try {
      const response = await api.get('/institute/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await api.put(`/institute/applications/${applicationId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  publishAdmissions: async (approvedApplications) => {
    try {
      const response = await api.post('/institute/publish-admissions', { applications: approvedApplications });
      return response.data;
    } catch (error) {
      console.error('Error publishing admissions:', error);
      throw error;
    }
  },

  // Admissions Management
  getAdmissionStats: async () => {
    const response = await api.get('/institute/admissions/stats');
    return response.data;
  },

  // Analytics & Reports
  getAnalytics: async (dateRange = '30days') => {
    const response = await api.get(`/institute/analytics?range=${dateRange}`);
    return response.data;
  },

  exportReport: async (format, dateRange) => {
    const response = await api.get(`/institute/analytics/export?format=${format}&range=${dateRange}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Settings Management
  getSettings: async () => {
    const response = await api.get('/institute/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/institute/settings', settings);
    return response.data;
  },

  testEmailConfig: async () => {
    const response = await api.post('/institute/settings/test-email');
    return response.data;
  },

  // Compliance & Workflow Utilities
  checkInstituteReadiness: async () => {
    const response = await api.get('/institute/readiness');
    return response.data;
  },

  checkStudentEligibility: async (courseId, studentId) => {
    const response = await api.get(`/institute/courses/${courseId}/check-eligibility/${studentId}`);
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/institute/notifications');
    return response.data;
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await api.put(`/institute/notifications/${notificationId}/read`);
    return response.data;
  }
};
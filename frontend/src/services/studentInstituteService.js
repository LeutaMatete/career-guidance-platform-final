import api from './api';

export const studentInstituteService = {
  // Browse courses from institutions
  getAvailableCourses: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.institutionId) queryParams.append('institution', filters.institutionId);
    if (filters.faculty) queryParams.append('faculty', filters.faculty);
    if (filters.search) queryParams.append('search', filters.search);
    
    const response = await api.get(`/student/courses?${queryParams}`);
    return response.data;
  },

  // Get course details with requirements
  getCourseDetails: async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}`);
    return response.data;
  },

  // Check eligibility for a course
  checkEligibility: async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/check-eligibility`);
    return response.data;
  },

  // Apply for courses (max 2 per institution)
  applyForCourses: async (applications) => {
    const response = await api.post('/student/applications', { applications });
    return response.data;
  },

  // View admission results
  getAdmissionResults: async () => {
    const response = await api.get('/student/admissions');
    return response.data;
  },

  // Get application status
  getApplicationStatus: async (applicationId) => {
    const response = await api.get(`/student/applications/${applicationId}`);
    return response.data;
  },

  // Receive notifications
  getNotifications: async () => {
    const response = await api.get('/student/notifications');
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await api.put(`/student/notifications/${notificationId}/read`);
    return response.data;
  }
};
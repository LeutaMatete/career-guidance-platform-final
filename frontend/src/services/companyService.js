import api from './api';

export const companyService = {
  // Status check - can be accessed regardless of company status
  getStatus: async () => {
    const response = await api.get('/company/status');
    return response.data;
  },
  
  // Profile management - requires active status
  getProfile: async () => {
    const response = await api.get('/company/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/company/profile', profileData);
    return response.data;
  },
  
  // Job Management
  getJobs: async () => {
    const response = await api.get('/company/jobs');
    return response.data;
  },
  
  createJob: async (jobData) => {
    const response = await api.post('/company/jobs', jobData);
    return response.data;
  },
  
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/company/jobs/${jobId}`, jobData);
    return response.data;
  },
  
  deleteJob: async (jobId) => {
    const response = await api.delete(`/company/jobs/${jobId}`);
    return response.data;
  },
  
  // Applications
  getApplicants: async (jobId) => {
    const response = await api.get(`/company/jobs/${jobId}/applicants`);
    return response.data;
  },
  
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.put(`/company/applications/${applicationId}/status`, { status });
    return response.data;
  },
  
  getJobApplications: async () => {
    const response = await api.get('/company/job-applications');
    return response.data;
  },
  
getApplicants: async () => {
  try {
    const response = await api.get('/company/applicants');
    return response.data;
  } catch (error) {
    console.error('Error fetching applicants via service:', error);
    // Attempt to get error message from response
    const errorMessage = error.response?.data?.message || 'Failed to fetch applicants';
    throw new Error(errorMessage);
  }
},

  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/company/analytics');
    return response.data;
  }
};
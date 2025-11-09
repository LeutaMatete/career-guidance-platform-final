import api from './api';

export const studentService = {
  // Profile management
  getProfile: async () => {
    try {
      const response = await api.get('/student/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/student/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

uploadDocument: async (formData) => {
    try {
      const response = await api.post('/student/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Crucial for file uploads
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      // Attempt to get error message from response
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      throw new Error(errorMessage);
    }
  },

  // Get documents (re-fetches the full profile to get updated documents)
  getDocuments: async () => {
    try {
      // This should ideally be a separate endpoint, but if it's part of the profile...
      const profileData = await api.get('/student/profile');
      // Return only the documents part of the profile
      return profileData.data.documents || {
        transcripts: [],
        certificates: [],
        identification: [],
        other: []
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

 uploadDocument: async (documentData) => {
    try {
      const response = await api.post('/student/documents/upload', documentData);
      return response.data;
    } catch (error) {
      console.error('Error uploading document via service:', error);
      // Attempt to get error message from response
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      throw new Error(errorMessage);
    }
  },

// Upload document (handles data URL sent from frontend)
uploadDocument: async (documentData) => {
  try {
    const response = await api.post('/student/documents/upload', documentData);
    return response.data;
  } catch (error) {
    console.error('Error uploading document via service:', error);
    // Attempt to get error message from response
    const errorMessage = error.response?.data?.message || 'Failed to upload document';
    throw new Error(errorMessage);
  }
},

  // Academic records and subject grades
  updateAcademicRecords: async (recordsData) => {
    try {
      const response = await api.put('/student/academic-records', recordsData);
      return response.data;
    } catch (error) {
      console.error('Error updating academic records:', error);
      throw error;
    }
  },

  getPopularSubjects: async () => {
    try {
      const response = await api.get('/student/subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  getGradeOptions: async () => {
    try {
      const response = await api.get('/student/grade-options');
      return response.data;
    } catch (error) {
      console.error('Error fetching grade options:', error);
      throw error;
    }
  },

  // Password change
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/student/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Courses
  getAvailableCourses: async () => {
    try {
      const response = await api.get('/student/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getQualifiedCourses: async () => {
    try {
      const response = await api.get('/student/courses/qualified');
      return response.data;
    } catch (error) {
      console.error('Error fetching qualified courses:', error);
      throw error;
    }
  },

  applyForCourse: async (applicationData) => {
    try {
      const response = await api.post('/student/apply', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for course:', error);
      throw error;
    }
  },

  getMyApplications: async () => {
    try {
      const response = await api.get('/student/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  withdrawApplication: async (applicationId) => {
    try {
      const response = await api.delete(`/student/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  },

  // Jobs
  getAvailableJobs: async () => {
    try {
      const response = await api.get('/student/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  applyForJob: async (jobData) => {
    try {
      const response = await api.post('/student/apply-job', jobData);
      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },

  getMyJobApplications: async () => {
    try {
      const response = await api.get('/student/job-applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error;
    }
  },

  // Documents - SINGLE uploadDocuments function
  uploadDocuments: async (formData) => {
    try {
      const response = await api.post('/student/upload-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  },

  getDocuments: async () => {
    try {
      const response = await api.get('/student/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/student/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  updateDocumentStatus: async (documentId, status) => {
    try {
      const response = await api.put(`/student/documents/${documentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  },

uploadDocument: async (documentData) => {
  try {
    const response = await api.post('/student/upload-documents', documentData);
    return response.data;
  } catch (error) {
    console.error('Error uploading document via service:', error);
    // Attempt to get error message from response
    const errorMessage = error.response?.data?.message || 'Failed to upload document';
    throw new Error(errorMessage);
  }
},

  // Document scanning
  scanDocument: async (documentData) => {
    try {
      const response = await api.post('/student/scan-document', documentData);
      return response.data;
    } catch (error) {
      console.error('Error scanning document:', error);
      throw error;
    }
  },

  // Get suggested courses
  getSuggestedCourses: async () => {
    try {
      const response = await api.get('/student/suggested-courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching suggested courses:', error);
      throw error;
    }
  },

  // Admissions
  getAdmissionResults: async () => {
    try {
      const response = await api.get('/student/admissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching admission results:', error);
      throw error;
    }
  }
};
import api from './api';

export const adminService = {
  // Institution Management
  getInstitutions: async () => {
    try {
      const response = await api.get('/admin/institutions');
      return response.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  },

  addInstitution: async (institutionData) => {
    try {
      const response = await api.post('/admin/institutions', institutionData);
      return response.data;
    } catch (error) {
      console.error('Error adding institution:', error);
      throw error;
    }
  },

  updateInstitution: async (id, institutionData) => {
    try {
      const response = await api.put(`/admin/institutions/${id}`, institutionData);
      return response.data;
    } catch (error) {
      console.error('Error updating institution:', error);
      throw error;
    }
  },

  deleteInstitution: async (id) => {
    try {
      const response = await api.delete(`/admin/institutions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting institution:', error);
      throw error;
    }
  },

  // Faculty Management
  addFaculty: async (facultyData) => {
    try {
      const response = await api.post('/admin/faculties', facultyData);
      return response.data;
    } catch (error) {
      console.error('Error adding faculty:', error);
      throw error;
    }
  },

  updateFaculty: async (id, facultyData) => {
    try {
      const response = await api.put(`/admin/faculties/${id}`, facultyData);
      return response.data;
    } catch (error) {
      console.error('Error updating faculty:', error);
      throw error;
    }
  },

  deleteFaculty: async (id) => {
    try {
      const response = await api.delete(`/admin/faculties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting faculty:', error);
      throw error;
    }
  },

  // Course Management
  addCourse: async (courseData) => {
    try {
      const response = await api.post('/admin/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  },

  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/admin/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/admin/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Company Management
  getCompanies: async () => {
    try {
      const response = await api.get('/admin/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  approveCompany: async (companyId) => {
    try {
      const response = await api.put(`/admin/companies/${companyId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving company:', error);
      throw error;
    }
  },

  suspendCompany: async (companyId) => {
    try {
      const response = await api.put(`/admin/companies/${companyId}/suspend`);
      return response.data;
    } catch (error) {
      console.error('Error suspending company:', error);
      throw error;
    }
  },

  deleteCompany: async (companyId) => {
    try {
      const response = await api.delete(`/admin/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  // User Management
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Admission Publishing
  publishAdmissions: async (admissionList) => {
    try {
      const response = await api.post('/admin/admissions/publish', { admissionList });
      return response.data;
    } catch (error) {
      console.error('Error publishing admissions:', error);
      throw error;
    }
  },

  // Reports
  getUserReports: async () => {
    try {
      const response = await api.get('/admin/reports/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reports:', error);
      throw error;
    }
  },

  getApplicationReports: async () => {
    try {
      const response = await api.get('/admin/reports/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching application reports:', error);
      throw error;
    }
  },

  getSystemReports: async () => {
    try {
      const response = await api.get('/admin/reports/system');
      return response.data;
    } catch (error) {
      console.error('Error fetching system reports:', error);
      throw error;
    }
  },

  // Profile Management
getProfile: async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
},

updateProfile: async (profileData) => {
  try {
    const response = await api.put('/admin/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
},

// Company management
getCompanies: async () => {
  const response = await api.get('/admin/companies');
  return response.data;
},

updateCompanyStatus: async (companyId, status) => {
  const response = await api.put(`/admin/companies/${companyId}/status`, { status });
  return response.data;
},

bulkUpdateCompanyStatus: async (companyIds, status) => {
  const response = await api.post('/admin/companies/bulk-status', { 
    companyIds, 
    status 
  });
  return response.data;
},

  // System Management
  checkCompliance: async () => {
    try {
      const response = await api.get('/admin/compliance/check');
      return response.data;
    } catch (error) {
      console.error('Error checking compliance:', error);
      throw error;
    }
  },

  exportReport: async (type) => {
    try {
      const response = await api.get(`/admin/reports/export?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  getSystemSettings: async () => {
    try {
      const response = await api.get('/admin/system/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  updateSystemSettings: async (settingsData) => {
    try {
      const response = await api.put('/admin/system/settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  runSystemCheck: async () => {
    try {
      const response = await api.post('/admin/system/check');
      return response.data;
    } catch (error) {
      console.error('Error running system check:', error);
      throw error;
    }
  },

  clearCache: async () => {
    try {
      const response = await api.post('/admin/system/cache/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  },

  getAuditLogs: async () => {
    try {
      const response = await api.get('/admin/system/logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }
};
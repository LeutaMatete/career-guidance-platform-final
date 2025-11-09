import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/auth.css';
import './styles/admin.css';
import './styles/common.css';
import './styles/company.css';
import './styles/institute.css';
import './styles/main.css';
import './styles/settings.css';
import './styles/student.css';
import './styles/adminInstitutions.css';
import './styles/adminCompany.css';
import './styles/adminUsers.css';
import './styles/adminReports.css';
import './styles/adminSystem.css';
import './styles/adminDashboard.css';
import './styles/Navbar.css';
import './styles/studentApplications.css';
import PublishResults from './components/institute/PublishResults'; // Import the new component


// Import common components
import PasswordReset from './components/common/PasswordReset';
import EmailVerification from './components/common/EmailVerification'; // Keep only this one
import ChangePassword from './components/common/ChangePassword';

// Student design styles
import './styles/studentJob.css';
import './styles/studentProfile.css';
import './styles/studentDocument.css';

// Import dashboard components
import StudentDashboard from './components/student/StudentDashboard';
import InstituteDashboard from './components/institute/InstituteDashboard';
import CompanyDashboard from './components/company/CompanyDashboard';
import AdminDashboard from './components/admin/Dashboard';

// Import student components
import CourseApplication from './components/student/CourseApplication';
import JobApplications from './components/student/JobApplications';
import Profile from './components/student/Profile';
import ViewAdmissions from './components/student/ViewAdmissions';
import MyApplications from './components/student/MyApplications';
import Documents from './components/student/Documents';
import SubjectGrades from './components/student/SubjectGrades';
import DocumentScanner from './components/student/DocumentScanner';

// Import institute components
import ManageCourses from './components/institute/ManageCourses';
import ManageFaculties from './components/institute/ManageFaculties';
import ViewApplications from './components/institute/ViewApplications';
import InstituteProfile from './components/institute/InstituteProfile';
import Analytics from './components/institute/Analytics';
import InstituteSettings from './components/institute/InstituteSettings';
import PublishAdmissions from './components/institute/PublishAdmissions';
import './styles/analytics.css';

// Import company components
import PostJob from './components/company/PostJob';
import ViewApplicants from './components/company/ViewApplicants';
import CompanyProfile from './components/company/CompanyProfile';
import ManageJobs from './components/company/ManageJobs';
import CompanyAnalytics from './components/company/CompanyAnalytics';
import './styles/CompanyAnalytics.css';

// Import admin components
import ManageInstitutions from './components/admin/ManageInstitutions';
import ManageCompanies from './components/admin/ManageCompanies';
import Reports from './components/admin/Reports';
import Users from './components/admin/Users';
import System from './components/admin/System';

// Import common components
import Settings from './components/common/Settings';
import ProtectedRoute from './components/common/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './styles/main.css';

// Component to redirect users to their role-specific dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'student':
      return <Navigate to="/student" replace />;
    case 'institute':
      return <Navigate to="/institute" replace />;
    case 'company':
      return <Navigate to="/company" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
               <Route path="/institute" element={<ProtectedRoute requiredRole="institute"><InstituteDashboard /></ProtectedRoute>} />
               <Route path="/institute/publish-results" element={<ProtectedRoute requiredRole="institute"><PublishResults /></ProtectedRoute>} /> {/* Add this route */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />                
              {/* Protected Routes - Role Specific Dashboards */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                } 
              />

              {/* Student Routes */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />

                          <Route 
                path="/student/document-scanner" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <DocumentScanner />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/student/courses" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <CourseApplication />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/grades" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <SubjectGrades />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/jobs" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <JobApplications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/admissions" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <ViewAdmissions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/applications" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <MyApplications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/documents" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <Documents />
                  </ProtectedRoute>
                } 
              />

              {/* Institute Routes */}
              <Route 
                path="/institute" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <InstituteDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/institute/admissions" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <PublishAdmissions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/institute/analytics" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/institute/settings" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <InstituteSettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/institute/courses" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <ManageCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/institute/faculties" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <ManageFaculties />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/institute/profile" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <InstituteProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/institute/applications" 
                element={
                  <ProtectedRoute requiredRole="institute">
                    <ViewApplications />
                  </ProtectedRoute>
                } 
              />

              {/* Company Routes */}
              <Route 
                path="/company" 
                element={
                  <ProtectedRoute requiredRole="company">
                    <CompanyDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/jobs" 
                element={
                  <ProtectedRoute requiredRole="company">
                    <ManageJobs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/jobs/post" 
                element={
                  <ProtectedRoute requiredRole="company">
                    <PostJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/analytics" 
                element={
                  <ProtectedRoute requiredRole="company">
                    <CompanyAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/applicants" 
                element={
                  <ProtectedRoute requiredRole="company">
                    <ViewApplicants />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/profile" 
                element={
                  <ProtectedRoute requiredRole="company">
                    <CompanyProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Users />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/system" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <System />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/institutions" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ManageInstitutions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/companies" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ManageCompanies />
                  </ProtectedRoute>
                } 
              />

              {/* Common Routes */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/password-reset" 
                element={<PasswordReset />} 
              />
              <Route 
                path="/change-password" 
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
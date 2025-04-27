import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/loginpage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import PackagePage from './pages/package';
import UserDashboard from './pages/dashboard/UserDashboard';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from "./Admin/components/AdminDashboard";
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import PrivacyPolicy from './pages/legal/pp';
import AddMemberPage from './Admin/components/AddMemberPage';

function App() {
  return (

    
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={5000}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/package" element={<PackagePage />} />
          <Route path="/reset-password/:id" element={<ResetPasswordPage />} />
          <Route path="/user-dashboard" element={
            <ProtectedRoute allowed={['Member']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
          {/* Admin routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowed={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/check-ins" element={
            <ProtectedRoute allowed={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin tab routes */}
          <Route path="/admin/members" element={
            <ProtectedRoute allowed={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/pending-approvals" element={
            <ProtectedRoute allowed={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/expiring-memberships" element={
            <ProtectedRoute allowed={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowed={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/add-member" element={
            <ProtectedRoute allowed={['Admin']}>
              <AddMemberPage/>
            </ProtectedRoute>
          } />

        <Route path="*" element={<Navigate to={"/"}   />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/loginpage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import PackagePage from './pages/package';
import UserDashboard from './pages/dashboard/UserDashboard';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import ProtectedRoute from './components/auth/ProtectedRoute';
// import Privacy from './pages/legal/PrivacyPolicy';

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
          <Route path="/user-dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/terms" element={<TermsAndConditions />} />
          {/* <Route path="/privacy" element={<Privacy/>} /> */}
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;

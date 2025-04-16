import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/loginpage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import PackagePage from './pages/package';
import TermsAndConditions from './pages/legal/TermsAndConditions';
// import Privacy from './pages/legal';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/package" element={<PackagePage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          {/* <Route path="/privacy" element={<Privacy/>} /> */}

        </Routes>
    </Router>
  );
}

export default App;

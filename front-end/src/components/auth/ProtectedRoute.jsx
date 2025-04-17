import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('auth');
        if (!authData) {
          setIsAuthenticated(false);
          enqueueSnackbar('Please login to access this page', { variant: 'warning' });
        } else {
          // Check if token is expired
          const { token } = JSON.parse(authData);
          if (!token) {
            setIsAuthenticated(false);
            localStorage.removeItem('auth');
            enqueueSnackbar('Your session has expired. Please login again', { variant: 'warning' });
          } else {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [enqueueSnackbar]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
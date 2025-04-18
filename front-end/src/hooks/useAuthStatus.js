import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a user is authenticated
 * @returns {Object} Authentication state and related functions
 */
const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth') 
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Get the current authentication token
   * @returns {string|null} The authentication token or null if not authenticated
   */
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  return { 
    isAuthenticated, 
    isLoading, 
    getAuthToken 
  };
};

export default useAuthStatus;
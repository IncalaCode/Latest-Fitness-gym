import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { API_URL } from '../config/config';

/**
 * Custom hook for handling forgot password functionality
 * @returns {Object} - Functions and state for forgot password operations
 */
const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Request password reset email
   * @param {string} email - User's email address
   * @returns {Promise<boolean>} - Success status
   */
  const requestPasswordReset = async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }
      
      setIsSuccess(true);
      enqueueSnackbar('Password reset email sent successfully', { 
        variant: 'success',
        autoHideDuration: 3000
      });
      
      return true;
    } catch (error) {
      setError(error.message || 'An error occurred while requesting password reset');
      enqueueSnackbar(error.message || 'Failed to send password reset email', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token from email
   * @param {string} resetData.password - New password
   * @returns {Promise<boolean>} - Success status
   */
  const resetPassword = async ({ token, password }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      setIsSuccess(true);
      enqueueSnackbar('Password has been reset successfully', { 
        variant: 'success',
        autoHideDuration: 3000
      });
      
      return true;
    } catch (error) {
      setError(error.message || 'An error occurred while resetting password');
      enqueueSnackbar(error.message || 'Failed to reset password', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset the hook state
   */
  const reset = () => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
  };

  return {
    requestPasswordReset,
    resetPassword,
    reset,
    isLoading,
    isSuccess,
    error
  };
};

export default useForgotPassword;
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { API_URL, GET_HEADER } from '../config/config';

const useProfileUpdate = (userId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get authentication headers
      const options = await GET_HEADER({ isJson: true });
      
      // Make API call to update user
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: options.headers,
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage with new user data
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsedAuth = JSON.parse(authData);
        parsedAuth.user = {
          ...parsedAuth.user,
          ...data.data
        };
        localStorage.setItem('auth', JSON.stringify(parsedAuth));
      }

      enqueueSnackbar('Profile updated successfully', { 
        variant: 'success',
        autoHideDuration: 3000
      });

      return data.data;
    } catch (error) {
      setError(error.message || 'An error occurred while updating your profile');
      enqueueSnackbar(error.message || 'Failed to update profile', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    isLoading,
    error
  };
};

export default useProfileUpdate;
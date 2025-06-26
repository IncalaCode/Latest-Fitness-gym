import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../../config/config';

export const useAdminProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const updateAdminProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const options = await GET_HEADER({ isJson: true });
      
      const response = await fetch(
        API_ENDPOINT_FUNCTION('/admin/update'), 
        {
          method: 'PUT',
          headers: options.headers,
          body: JSON.stringify(profileData)
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      enqueueSnackbar('Profile updated successfully', { 
        variant: 'success',
        autoHideDuration: 3000
      });
      
      return data;
    } catch (err) {
      setError(err.message);
      enqueueSnackbar(err.message || 'Failed to update profile', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateAdminProfile,
    loading,
    error
  };
};

export default useAdminProfile;
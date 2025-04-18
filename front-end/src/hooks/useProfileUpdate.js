import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { API_URL, GET_HEADER } from '../config/config';

const useProfileUpdate = (userId , fetchDashboardData) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const base64ToFile = (base64String, filename) => {
    if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:')) {
      return null;
    }

    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const options = await GET_HEADER();
      const { email, photoUrl, ...updateData } = userData;
      
      const formData = new FormData();
      
      Object.keys(updateData).forEach(key => {
        formData.append(key, updateData[key]);
      });
      
      if (photoUrl) {
        if (photoUrl instanceof File) {
          formData.append('photo', photoUrl);
        } else if (typeof photoUrl === 'string' && photoUrl.startsWith('data:')) {
          const photoFile = base64ToFile(photoUrl, `profile-${Date.now()}.jpg`);
          if (photoFile) {
            formData.append('photo', photoFile);
          }
        }
      }

      console.log(Object.fromEntries(formData));
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: options.headers,
        body: formData
      });


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsedAuth = JSON.parse(authData);
        const originalEmail = parsedAuth.user.email;
        parsedAuth.user = {
          ...parsedAuth.user,
          ...data.data,
          email: originalEmail
        };
        localStorage.setItem('auth', JSON.stringify(parsedAuth));
      }

      fetchDashboardData()
      
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

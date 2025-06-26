import { useState } from 'react';
import { API_URL } from '../config/config';
import { GET_HEADER } from '../config/config';

const useAddMember = () => {
  const [loading, setLoading] = useState(false);

  const addMember = async (formData) => {
    try {
      setLoading(true);
      
      const options = await GET_HEADER({ isJson: false });
      console.log("here" + Object.fromEntries(formData))
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          ...options.headers,
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }

      return { success: true }; // Return success
    } catch (err) {
      console.error('Error adding member:', err);
      return { 
        success: false, 
        error: err.message || 'An error occurred while adding the member' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    addMember,
    loading
  };
};

export default useAddMember;
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { API_URL, GET_HEADER } from '../../config/config';

const usePackageSubmit = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handlePackageSubmit = async (formData, currentPackage, onSuccess) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name || !formData.price || !formData.duration) {
        throw new Error('Name, price, and duration are required fields');
      }

      // Validate special access time slots
      if (formData.accessLevel === 'special' && (!formData.startTime || !formData.endTime)) {
        throw new Error('Start and end time are required for special access packages');
      }

      // Validate benefits field
      if (formData.benefits && !Array.isArray(formData.benefits)) {
        throw new Error('Benefits must be an array');
      }

      const url = currentPackage
        ? `${API_URL}/packages/${currentPackage.id}`
        : `${API_URL}/packages`;

      const method = currentPackage ? 'PUT' : 'POST';

      // Clean up form data - remove empty strings and convert numbers
      const cleanedData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        numberOfPasses: formData.numberOfPasses ? parseInt(formData.numberOfPasses) : null,
        benefits: formData.benefits || [],
        // Only include time fields for special access
        ...(formData.accessLevel === 'special' && {
          startTime: formData.startTime,
          endTime: formData.endTime
        })
      };

      // Remove time fields if not special access
      if (formData.accessLevel !== 'special') {
        delete cleanedData.startTime;
        delete cleanedData.endTime;
      }

      const { headers } = await GET_HEADER({ isJson: true });

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(cleanedData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save package');
      }

      enqueueSnackbar(
        currentPackage ? 'Package updated successfully' : 'Package created successfully',
        { variant: 'success' }
      );

      if (onSuccess) {
        onSuccess(responseData.data);
      }

      return { success: true, data: responseData.data };
    } catch (error) {
      console.error('Package submit error:', error);
      enqueueSnackbar(error.message, { variant: 'error' });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    handlePackageSubmit,
    loading
  };
};

export default usePackageSubmit;
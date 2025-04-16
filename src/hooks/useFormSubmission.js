import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useFormSubmission = (submitFn, options = {}) => {
  const {
    successRedirect,
    onSuccess,
    onError
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle form submission
   * @param {Object} formData - The form data to submit
   * @returns {Promise} - Promise that resolves when submission is complete
   */
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Call the submission function (e.g., API call)
      const result = await submitFn(formData);
      
      // Set success state
      setSuccess(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Redirect if path is provided
      if (successRedirect) {
        navigate(successRedirect);
      }
      
      return result;
    } catch (err) {
      // Set error state
      setError(err.message || 'An error occurred during submission');
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
};

export default useFormSubmission;
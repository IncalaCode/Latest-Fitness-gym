import { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../../config/config";

const useQRVerification = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const verifyQRCode = async (qrData) => {
    try {
      setLoading(true);
      setError(null);
      setVerificationResult(null);

      // Ensure qrData is properly formatted
      const formattedQRData = typeof qrData === 'string' ? qrData : JSON.stringify(qrData);
      
      // Get authentication headers
      const headers = await GET_HEADER({ isJson: true });
      
      // Make API request
      const response = await axios({
        method: 'PUT',
        url: API_ENDPOINT_FUNCTION('/admin/verify'),
        data: { qrData: formattedQRData },
        headers: headers.headers
      });

      // Process successful response
      const data = response.data;
      setVerificationResult(data);
      
      // Show success notification
      enqueueSnackbar(data.message || 'QR code verified successfully', {
        variant: 'success'
      });
      
      return data;
    } catch (error) {
      // Handle error response
      console.error('Error verifying QR code:', error);
      
      // Extract error message from axios error
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to verify QR code';
      
      setError(errorMessage);
      
      // Show error notification
      enqueueSnackbar(errorMessage, {
        variant: 'error'
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    verifyQRCode,
    verificationResult,
    loading,
    error,
    clearVerificationResult: () => setVerificationResult(null),
    clearError: () => setError(null)
  };
};

export default useQRVerification;
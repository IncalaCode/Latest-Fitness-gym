import { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../../config/config";

const useQRVerification = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unfreezeLoading, setUnfreezeLoading] = useState(false);
  const [unfreezeSuccess, setUnfreezeSuccess] = useState(null);
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

      // Extract error message and data from axios error
      const errorData = error.response?.data || {};
      const errorMessage = errorData.message || error.message || 'Failed to verify QR code';

      // Special handling for frozen memberships
      if (errorMessage.includes('frozen')) {
        // Store the full error data for the UI to use
        setError(`Membership is frozen: Error: ${JSON.stringify({
          isFrozen: errorData.isFrozen,
          freezeEndDate: errorData.freezeEndDate,
          paymentId: errorData.paymentId,
          qrData: errorData.qrData
        })}`);

        // Show a more user-friendly notification
        enqueueSnackbar('This membership is currently frozen', {
          variant: 'info'
        });
      } else {
        // For other errors, just store the message
        setError(errorMessage);

        // Show error notification
        enqueueSnackbar(errorMessage, {
          variant: 'error'
        });
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to unfreeze a payment
  const unfreezePayment = async (paymentId) => {
    try {
      setUnfreezeLoading(true);
      setUnfreezeSuccess(null);

      // Get authentication headers
      const headers = await GET_HEADER({ isJson: true });

      // Make API request to unfreeze the payment
      const response = await axios({
        method: 'POST',
        url: API_ENDPOINT_FUNCTION('/admin/payment/unfreeze'),
        data: { paymentId },
        headers: headers.headers
      });

      // Process successful response
      const data = response.data;
      setUnfreezeSuccess(data);

      // Clear the error since we've successfully unfrozen the membership
      setError(null);

      // Show success notification
      enqueueSnackbar(data.message || 'Membership unfrozen successfully', {
        variant: 'success'
      });

      return data;
    } catch (error) {
      // Handle error response
      console.error('Error unfreezing payment:', error);

      // Extract error message from axios error
      const errorMessage = error.response?.data?.message || error.message || 'Failed to unfreeze membership';

      // Show error notification
      enqueueSnackbar(errorMessage, {
        variant: 'error'
      });

      setUnfreezeSuccess(false);
      return null;
    } finally {
      setUnfreezeLoading(false);
    }
  };

  // Function to clear unfreeze success state
  const clearUnfreezeSuccess = () => {
    setUnfreezeSuccess(null);
  };

  return {
    verifyQRCode,
    unfreezePayment,
    verificationResult,
    loading,
    unfreezeLoading,
    unfreezeSuccess,
    error,
    clearVerificationResult: () => setVerificationResult(null),
    clearError: () => setError(null),
    clearUnfreezeSuccess
  };
};

export default useQRVerification;
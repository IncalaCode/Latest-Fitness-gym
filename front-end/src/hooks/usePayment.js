import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from './useAuthStatus';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../config/config';


const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStatus();

  /**
   * Open payment method selection modal
   * @param {Object} plan - The selected plan object
   */
  const openPaymentMethodModal = (plan) => {
    if (!isAuthenticated) {
      // Save selected plan to localStorage for retrieval after login
      localStorage.setItem('selectedPlan', JSON.stringify({ 
        title: plan.title, 
        price: plan.price || plan.priceValue 
      }));
      
      navigate('/login', { 
        state: { 
          from: 'services', 
          message: 'Please log in to subscribe to a plan' 
        } 
      });
      
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  /**
   * Close payment method selection modal
   */
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const processPayment = async (paymentMethod, currency = 'ETB') => {
    if (!selectedPlan) {
      setError('No plan selected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (!selectedPlan.title || !selectedPlan.priceValue) {
        throw new Error('Invalid plan information');
      }

      const headers = await GET_HEADER({ isJson: true });
      
      const response = await fetch(API_ENDPOINT_FUNCTION('/payment/payinit'), {
        method: 'POST',
        headers: headers.headers,
        body: JSON.stringify({
          planTitle: selectedPlan.title,
          planPrice: selectedPlan.priceValue,
          currency,
          paymentMethod
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const paymentData = await response.json();
      
      // Close the modal after successful payment initialization
      closePaymentModal();
      
      // Handle payment response
      if (paymentData.redirectUrl) {
        window.location.href = paymentData.redirectUrl;
      } else if (paymentData.paymentId) {
        navigate(`/payment/${paymentData.paymentId}`);
      } else {
        throw new Error('Invalid payment response from server');
      }
      
      return paymentData;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while initializing payment';
      setError(errorMessage);
      console.error('Payment initialization error:', err);
      // Throw a formatted error that notistack can handle
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Legacy function for backward compatibility
   * @param {Object} plan - The selected plan object
   * @param {string} [currency='ETB'] - Currency code
   */
  const initializePayment = async (plan, currency = 'ETB') => {
    openPaymentMethodModal(plan);
  };

  return {
    initializePayment,
    openPaymentMethodModal,
    closePaymentModal,
    processPayment,
    showPaymentModal,
    selectedPlan,
    isLoading,
    error,
    setError,
    isAuthenticated
  };
};

export default usePayment;

import { useState, useEffect } from 'react';
import axios from 'axios';

const useExpiringMemberships = () => {
  const [expiringMemberships, setExpiringMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchExpiringMemberships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/memberships/expiring');
      setExpiringMemberships(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expiring memberships');
      console.error('Error fetching expiring memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (membershipId) => {
    try {
      const response = await axios.post(`/api/memberships/reminder/${membershipId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (err) {
      console.error('Error sending reminder:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send reminder'
      };
    }
  };

  useEffect(() => {
    fetchExpiringMemberships();
  }, []);

  return {
    expiringMemberships,
    loading,
    error,
    refreshMemberships: fetchExpiringMemberships,
    sendReminder
  };
};

export default useExpiringMemberships;
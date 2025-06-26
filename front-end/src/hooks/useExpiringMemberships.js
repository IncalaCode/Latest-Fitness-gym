import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, GET_HEADER } from '../config/config';

const useExpiringMemberships = () => {
  const [expiringMemberships, setExpiringMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchExpiringMemberships = async () => {
    try {
      setLoading(true);
      const options = await GET_HEADER();
      const response = await axios.get(`${API_URL}/memberships/expiring`, options);
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
      const options = await GET_HEADER();
      const response = await axios.post(`${API_URL}/memberships/reminder/${membershipId}`, {}, options);
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

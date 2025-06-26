import { useState } from 'react';
import { API_URL, GET_HEADER } from '../../config/config';

export default function useTrainerClients() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);

  const getTrainerClients = async (trainerId) => {
    setLoading(true);
    setError(null);
    try {
      const { headers } = await GET_HEADER();
      const res = await fetch(`${API_URL}/trainers/${trainerId}/clients`, {
        method: 'GET',
        headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch clients');
      setClients(data.data);
      return data.data;
    } catch (err) {
      setError(err.message);
      setClients([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { clients, loading, error, getTrainerClients };
} 
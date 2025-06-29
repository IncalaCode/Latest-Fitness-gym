import { useState, useEffect } from 'react';
import { API_URL, GET_HEADER } from '../config/config';

const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState({
    packages: [],
    trainers: [],
    packageTypes: [],
    expirationStatuses: [],
    sortOptions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const options = await GET_HEADER({ isJson: true });
      
      const response = await fetch(
        `${API_URL}/users/filter-options`,
        {
          method: 'GET',
          headers: options.headers
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }

      const data = await response.json();

      if (data.success) {
        setFilterOptions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch filter options');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching filter options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  return {
    filterOptions,
    loading,
    error,
    refetch: fetchFilterOptions
  };
};

export default useFilterOptions; 
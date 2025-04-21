import { useState, useEffect } from 'react';
import { API_URL, GET_HEADER } from '../config/config';

const useMembers = (rowsPerPage = 10) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch members data from the API
  const fetchMembers = async (page = 1, limit = rowsPerPage) => {
    try {
      setLoading(true);
      const options = await GET_HEADER({ isJson: true });
      const response = await fetch(
        `${API_URL}/users?page=${page}&limit=${limit}`, 
        { 
          method: 'GET',
          headers: options.headers
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      
      if (data.success) {
        setMembers(data.data.map(user => {
          // Extract year from dateOfBirth (format: YYYY-MM-DD)
          const birthYear = user.dateOfBirth ? new Date(user.dateOfBirth).getFullYear() : 'N/A';
          
          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            membershipType: user.role,
            status: user.isActive ? 'Active' : 'Inactive',
            phone: user.phone || 'N/A',
            emergencyContact: user.emergencyContact || 'N/A',
            address: user.address || 'N/A',
            birthYear: birthYear,
            lastVisit: 'N/A', // This data isn't available in the User model
            photoUrl: user.photoUrl
          };
        }));
        
        setTotalMembers(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / limit));
      } else {
        throw new Error(data.message || 'Failed to fetch members');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Fetch members when component mounts or when page/rowsPerPage changes
  useEffect(() => {
    fetchMembers(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  return {
    members,
    loading,
    error,
    currentPage,
    totalPages,
    totalMembers,
    rowsPerPage,
    handlePageChange,
    refetch: () => fetchMembers(currentPage, rowsPerPage)
  };
};

export default useMembers;

import { useState, useEffect, useMemo } from 'react';
import { API_URL, GET_HEADER } from '../config/config';

const useMembers = (rowsPerPage = 10) => {
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const options = await GET_HEADER({ isJson: true });
      const response = await fetch(
        `${API_URL}/users`, 
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
        const formattedMembers = data.data.map(user => {
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
            photoUrl: user.photoUrl,
            membership: user.membership,
            membershipStatus: user.membershipStatus,
            membershipExpiry: user.membershipExpiry,
            qrcodeData: user.qrcodeData // Include QR code data from the API response
          };
        });
        
        setAllMembers(formattedMembers);
        setTotalMembers(formattedMembers.length);
        setTotalPages(Math.ceil(formattedMembers.length / rowsPerPage));
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const members = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return allMembers.slice(startIndex, endIndex);
  }, [allMembers, currentPage, rowsPerPage]);


  useEffect(() => {
    setTotalPages(Math.ceil(totalMembers / rowsPerPage));
  }, [rowsPerPage, totalMembers]);

  // Fetch all members when component mounts
  useEffect(() => {
    fetchAllMembers();
  }, []);

  return {
    members,
    loading,
    error,
    currentPage,
    totalPages,
    totalMembers,
    rowsPerPage,
    handlePageChange,
    refetch: fetchAllMembers
  };
};

export default useMembers;

import { useState, useEffect, useMemo } from 'react';
import { API_URL, GET_HEADER } from '../config/config';

const useMembers = (rowsPerPage = 10) => {
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter and search state
  const [filters, setFilters] = useState({
    search: '',
    packageId: '',
    expirationStatus: '',
    sortBy: 'fullName',
    sortOrder: 'asc'
  });

  const fetchAllMembers = async (newFilters = null) => {
    try {
      setLoading(true);
      const options = await GET_HEADER({ isJson: true });
      
      // Use new filters if provided, otherwise use current filters
      const currentFilters = newFilters || filters;
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        ...currentFilters
      });

      const response = await fetch(
        `${API_URL}/users?${queryParams}`,
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
            emergencyContact: user.emergencyContactPhone || 'N/A',
            address: user.address || 'N/A',
            birthYear: birthYear,
            photoUrl: user.photoUrl,
            membership: user.membership,
            membershipStatus: user.membershipStatus,
            membershipExpiry: user.membershipExpiry,
            qrcodeData: user.qrcodeData,
            paymentId: user.paymentId,
            isFrozen: user.isFrozen || false,
            freezeStartDate: user.freezeStartDate,
            freezeEndDate: user.freezeEndDate,
            originalExpiryDate: user.originalExpiryDate,
            trainerId: user.trainerId,
            trainer: user.trainer,
            trainerName: user.trainer ? user.trainer.name : 'Unassigned',
            totalPasses: user.totalPasses || 0
          };
        });

        setAllMembers(formattedMembers);
        setTotalMembers(data.totalCount || formattedMembers.length);
        setTotalPages(data.totalPages || Math.ceil(formattedMembers.length / rowsPerPage));
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

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  const handleSort = (sortBy, sortOrder) => {
    updateFilters({ sortBy, sortOrder });
  };

  const members = useMemo(() => {
    return allMembers;
  }, [allMembers]);

  useEffect(() => {
    setTotalPages(Math.ceil(totalMembers / rowsPerPage));
  }, [rowsPerPage, totalMembers]);

  // Fetch members when component mounts or when filters/page changes
  useEffect(() => {
    fetchAllMembers();
  }, [currentPage, filters]);

  // Reassign or remove trainer for a member
  const reassignOrRemoveTrainer = async (memberId, trainerId = null) => {
    try {
      const options = await GET_HEADER({ isJson: true });
      const response = await fetch(`${API_URL}/memberships/reassign-trainer`, {
        method: 'POST',
        headers: options.headers,
        body: JSON.stringify({ memberId, trainerId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update trainer');
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    currentPage,
    totalPages,
    totalMembers,
    rowsPerPage,
    filters,
    handlePageChange,
    updateFilters,
    handleSearch,
    handleSort,
    refetch: () => fetchAllMembers(),
    reassignOrRemoveTrainer
  };
};

export default useMembers;

import { useState, useEffect, useRef } from "react";
import useMembers from "../../../hooks/useMembers";
import useFilterOptions from "../../../hooks/useFilterOptions";
import { IMAGE_URL, API_URL } from "../../../config/config";
import { Phone, MapPin, AlertCircle, Calendar, UserPlus, QrCode, Snowflake, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import { useSnackbar } from 'notistack';
import PackageModal from "./member modals/PackageModal";
import FreezeModal from "./member modals/FreezeModal";
import TrainerReassignModal from "./member modals/TrainerReassignModal";
import useTrainers from "../../hooks/useTrainers";
import usePackages from '../../hooks/usePackages';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Snackbar,
  CircularProgress,
  TableSortLabel,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MembersTabUpdated({ rowsPerPage = 10 }) {
  const {
    members,
    loading,
    error,
    currentPage,
    totalPages,
    totalMembers,
    filters,
    handlePageChange,
    updateFilters,
    handleSearch,
    handleSort,
    refetch,
    reassignOrRemoveTrainer
  } = useMembers(rowsPerPage);
  
  const { filterOptions, loading: filterOptionsLoading } = useFilterOptions();
  const { trainers } = useTrainers();
  const { packages } = usePackages();

  const [isMobile, setIsMobile] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const qrCodeRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState([]);
  const [bulkDeleteSnackbarOpen, setBulkDeleteSnackbarOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const bulkDeleteTimeoutRef = useRef(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    fields: ['name', 'email', 'membership', 'membershipStatus', 'phone', 'emergencyContact', 'address', 'birthYear']
  });

  const [trainerModalOpen, setTrainerModalOpen] = useState(false);
  const [trainerModalLoading, setTrainerModalLoading] = useState(false);

  // Upgrade package dialog state
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeMember, setUpgradeMember] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Action modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedMemberForAction, setSelectedMemberForAction] = useState(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Filter functions
  const handleFilterChange = (filterType, value) => {
    updateFilters({ [filterType]: value });
  };

  const clearFilters = () => {
    updateFilters({
      packageId: '',
      expirationStatus: '',
      sortBy: 'fullName',
      sortOrder: 'asc'
    });
  };

  // Function to handle buy button click
  const handleBuyClick = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    refetch();
  };

  // Function to handle QR code button click
  const handleQrCodeClick = (member) => {
    setSelectedMember(member);
    setLoadingQrCode(true);

    try {
      if (member.qrcodeData) {
        setQrCodeData(member.qrcodeData);
      } else {
        const qrCodeInfo = {
          memberId: member.id,
          name: member.name,
          membership: member.membership || 'Not specified',
          status: member.membershipStatus || 'inactive',
          expiryDate: member.membershipExpiry || 'Not specified'
        };
        setQrCodeData(JSON.stringify(qrCodeInfo));
      }

      setShowQrCode(true);
    } catch (error) {
      console.error("Error processing QR code data:", error);
      enqueueSnackbar(`Error processing QR code data: ${error.message}`, {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    } finally {
      setLoadingQrCode(false);
    }
  };

  // Function to close QR code modal
  const closeQrCodeModal = () => {
    setShowQrCode(false);
    setQrCodeData(null);
    setSelectedMember(null);
  };

  // Function to handle freeze button click
  const handleFreezeClick = (member, frozen) => {
    setSelectedMember(member);
    setIsFrozen(frozen);
    setIsFreezeModalOpen(true);
  };

  // Function to close the freeze modal
  const closeFreezeModal = (success) => {
    setIsFreezeModalOpen(false);
    setSelectedMember(null);
    setIsFrozen(false);

    if (success) {
      refetch();
    }
  };

  // Function to download QR code
  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;

    try {
      const svgElement = qrCodeRef.current.querySelector('svg');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = svgRect.width * 2;
      canvas.height = svgRect.height * 2;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8');
      const svgBase64 = btoa(decoder.decode(encoder.encode(svgData)));
      const dataURL = 'data:image/svg+xml;base64,' + svgBase64;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngDataUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl;
        downloadLink.download = `${selectedMember.name}-membership-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      img.src = dataURL;

    } catch (error) {
      console.error("Error downloading QR code:", error);
      enqueueSnackbar("Failed to download QR code. Please try again.", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    }
  };

  // Function to render pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 sm:px-3 py-1 mx-1 my-1 rounded text-sm ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6 flex-wrap px-2 sm:px-0">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-2 sm:px-3 py-1 mx-1 my-1 rounded text-sm ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Previous
        </button>

        <div className="flex flex-wrap">
          {pages}
        </div>

        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-3 py-1 mx-1 my-1 rounded text-sm ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  // Function to render member status badge
  const renderStatusBadge = (membershipStatus, isFrozen) => {
    const status = typeof membershipStatus === 'string' ? membershipStatus.toLowerCase() : '';

    if (status === "active" && isFrozen) {
      return (
        <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-cyan-100 text-cyan-800">
          Frozen
        </span>
      );
    }

    return (
      <span
        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
          status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {status === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  // Function to render action buttons based on membership status
  const renderActionButtons = (member) => {
    return (
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-600 transition-colors flex items-center"
        onClick={() => handleActionModalOpen(member)}
        title="View actions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        Actions
      </button>
    );
  };

  // Function to render member avatar
  const renderAvatar = (member) => (
    <div className="h-10 w-10 flex-shrink-0">
      {member.photoUrl ? (
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={`${IMAGE_URL}${member.photoUrl}`}
          alt={member.name}
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
          {member.name.charAt(0)}
        </div>
      )}
    </div>
  );

  // Export functions
  function arrayToCSV(data, fields) {
    const csvRows = [];
    csvRows.push(fields.join(','));
    for (const row of data) {
      const values = fields.map(field => {
        let value = row[field];
        if (Array.isArray(value)) value = value.join('; ');
        if (value === undefined || value === null) value = '';
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }

  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const handleExport = () => {
    if (exportOptions.format === 'csv') {
      const csv = arrayToCSV(members, exportOptions.fields);
      downloadCSV(csv, 'members_export.csv');
    } else if (exportOptions.format === 'pdf') {
      const doc = new jsPDF();
      const tableData = members.map(row =>
        exportOptions.fields.map(field => Array.isArray(row[field]) ? row[field].join('; ') : row[field] ?? '')
      );
      autoTable(doc, {
        head: [exportOptions.fields],
        body: tableData,
      });
      doc.save('members_export.pdf');
    } else {
      alert('Only CSV and PDF export are supported in the browser.');
    }
    setExportDialogOpen(false);
  };

  const handleTrainerModalOpen = (member) => {
    setSelectedMember(member);
    setTrainerModalOpen(true);
  };

  const handleTrainerModalClose = () => {
    setTrainerModalOpen(false);
    setSelectedMember(null);
  };

  const handleTrainerModalSubmit = async (trainerId) => {
    setTrainerModalLoading(true);
    try {
      await reassignOrRemoveTrainer(selectedMember.id, trainerId);
      enqueueSnackbar(trainerId ? 'Trainer reassigned successfully!' : 'Trainer removed successfully!', { variant: 'success' });
      handleTrainerModalClose();
      refetch();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to update trainer', { variant: 'error' });
    } finally {
      setTrainerModalLoading(false);
    }
  };

  const handleUpgradeClick = (member) => {
    setUpgradeMember(member);
    setSelectedPackageId('');
    setUpgradeDialogOpen(true);
  };

  const handleUpgradeDialogClose = () => {
    setUpgradeDialogOpen(false);
    setUpgradeMember(null);
    setSelectedPackageId('');
  };

  const handleUpgradeConfirm = async () => {
    if (!selectedPackageId) return;
    setUpgradeLoading(true);
    try {
      const { headers } = await import('../../../config/config').then(m => m.GET_HEADER({ isJson: true }));
      const response = await fetch(`${API_URL}/memberships/upgrade`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ memberId: upgradeMember.id, newPackageId: selectedPackageId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to upgrade package');
      enqueueSnackbar('Package upgraded successfully!', { variant: 'success' });
      handleUpgradeDialogClose();
      refetch();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to upgrade package', { variant: 'error' });
    } finally {
      setUpgradeLoading(false);
    }
  };

  // Action modal functions
  const handleActionModalOpen = (member) => {
    setSelectedMemberForAction(member);
    setActionModalOpen(true);
  };

  const handleActionModalClose = () => {
    setActionModalOpen(false);
    setSelectedMemberForAction(null);
  };

  const handleActionClick = (action) => {
    if (!selectedMemberForAction) return;
    
    switch (action) {
      case 'buy':
        handleBuyClick(selectedMemberForAction);
        break;
      case 'freeze':
        handleFreezeClick(selectedMemberForAction, false);
        break;
      case 'unfreeze':
        handleFreezeClick(selectedMemberForAction, true);
        break;
      case 'trainer':
        handleTrainerModalOpen(selectedMemberForAction);
        break;
      case 'qr':
        handleQrCodeClick(selectedMemberForAction);
        break;
      case 'upgrade':
        handleUpgradeClick(selectedMemberForAction);
        break;
      default:
        break;
    }
    
    handleActionModalClose();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading members: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-2 sm:px-0">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">Members</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {members.length} of {totalMembers} members
          </div>
          <Link
            to="/admin/add-member"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlus size={16} className="mr-2" />
            Add Member
          </Link>
          <Button
            variant="contained"
            onClick={() => setExportDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search by Name or Email"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />
                }}
              />
            </Grid>

            {/* Filter Toggle */}
            <Grid item xs={12} md={8}>
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  startIcon={<Filter />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
                {(filters.packageId || filters.expirationStatus) && (
                  <Button
                    variant="text"
                    onClick={clearFilters}
                    size="small"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Grid>

            {/* Filter Options */}
            {showFilters && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Package Type Filter */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl sx={{ minWidth: 120 }} fullWidth size="small">
                      <InputLabel>Package Type</InputLabel>
                      <Select
                        value={filters.packageId}
                        onChange={(e) => handleFilterChange('packageId', e.target.value)}
                        label="Package Type"
                      >
                        <MenuItem value="">All Packages</MenuItem>
                        {filterOptions.packages && filterOptions.packages.map((pkg) => (
                          <MenuItem key={pkg.id} value={pkg.id}>{pkg.name} - {pkg.price} ETB</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Expiration Status Filter */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ minWidth: 120 }} size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.expirationStatus}
                        onChange={(e) => handleFilterChange('expirationStatus', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="">All Status</MenuItem>
                        {filterOptions.expirationStatuses && filterOptions.expirationStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sort Options */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        label="Sort By"
                      >
                        {filterOptions.sortOptions && filterOptions.sortOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sort Order */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl sx={{ minWidth: 120 }} fullWidth size="small">
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={filters.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        label="Order"
                      >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Mobile View - Card Layout */}
      {isMobile && (
        <div className="space-y-4 px-2 sm:px-0">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {renderAvatar(member)}
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      {member.name}
                    </div>
                    <div className="text-gray-500 text-sm">{member.email}</div>
                  </div>
                </div>
                <div>{renderStatusBadge(member.membershipStatus, member.isFrozen)}</div>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex items-start">
                  <div className="text-gray-500 mr-2">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm">{member.phone}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-gray-500 mr-2">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Emergency Contact
                    </div>
                    <div className="text-sm">{member.emergencyContact}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-gray-500 mr-2">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-sm">{member.address}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-gray-500 mr-2">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Birth Year</div>
                    <div className="text-sm">{member.birthYear}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-gray-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 14v7m-7-7a7 7 0 0114 0" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Trainer</div>
                    <div className="text-sm">{member.trainerName}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-gray-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Passes</div>
                    <div className="text-sm">{member.totalPasses || 0}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-gray-500 mr-2">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Action</div>
                    <div className="flex flex-col gap-2">
                      {renderActionButtons(member)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">
                    {member.membership}
                  </div>
                  {member.membershipExpiry && (
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(member.membershipExpiry).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop View - Table Layout */}
      {!isMobile && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'fullName'}
                    direction={filters.sortBy === 'fullName' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('fullName', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    Member
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'membership'}
                    direction={filters.sortBy === 'membership' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('membership', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    Membership Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'membershipStatus'}
                    direction={filters.sortBy === 'membershipStatus' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('membershipStatus', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    Membership Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Emergency Contact</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Birth Year</TableCell>
                <TableCell>Trainer</TableCell>
                <TableCell>Passes</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'membershipExpiry'}
                    direction={filters.sortBy === 'membershipExpiry' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('membershipExpiry', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    Expiry Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <div className="flex items-center">
                      {renderAvatar(member)}
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.membership}</TableCell>
                  <TableCell>{renderStatusBadge(member.membershipStatus, member.isFrozen)}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.emergencyContact}</TableCell>
                  <TableCell>{member.address}</TableCell>
                  <TableCell>{member.birthYear}</TableCell>
                  <TableCell>{member.trainerName}</TableCell>
                  <TableCell>{member.totalPasses}</TableCell>
                  <TableCell>
                    {member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{renderActionButtons(member)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && renderPagination()}

      {/* Package Modal */}
      <PackageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        member={selectedMember}
      />

      {/* Freeze Modal */}
      <FreezeModal
        isOpen={isFreezeModalOpen}
        onClose={closeFreezeModal}
        member={selectedMember}
        isFrozen={isFrozen}
      />

      {/* QR Code Modal */}
      {showQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6">
            <button
              onClick={closeQrCodeModal}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Membership QR Code</h2>
              <p className="text-gray-600 mt-1">
                {selectedMember?.name}'s membership QR code
              </p>
              {selectedMember?.membershipExpiry && (
                <p className="text-sm text-gray-500 mt-1">
                  Expires: {new Date(selectedMember.membershipExpiry).toLocaleDateString()}
                </p>
              )}
            </div>

            <div
              ref={qrCodeRef}
              className="flex justify-center items-center bg-white p-4 rounded-lg shadow-inner mb-6"
            >
              {loadingQrCode ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              ) : (
                <QRCodeSVG
                  value={qrCodeData || "No membership data available"}
                  size={200}
                  level="H"
                  margin={10}
                  imageSettings={{
                    src: "/logo.png",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              )}
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">
                Scan this QR code to verify membership
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={downloadQRCode}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Members</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Format"
            value={exportOptions.format}
            onChange={(e) => setExportOptions({...exportOptions, format: e.target.value})}
            fullWidth
            margin="normal"
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
          </TextField>
          <div style={{ marginTop: 16 }}>
            <h4>Select Fields to Export</h4>
            {['name', 'email', 'membership', 'membershipStatus', 'phone', 'emergencyContact', 'address', 'birthYear'].map((field) => (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={exportOptions.fields.includes(field)}
                    onChange={(e) => {
                      const newFields = e.target.checked
                        ? [...exportOptions.fields, field]
                        : exportOptions.fields.filter(f => f !== field);
                      setExportOptions({...exportOptions, fields: newFields});
                    }}
                  />
                }
                label={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>

      {/* Trainer Reassign Modal */}
      <TrainerReassignModal
        open={trainerModalOpen}
        onClose={handleTrainerModalClose}
        member={selectedMember}
        trainers={trainers}
        onSubmit={handleTrainerModalSubmit}
        loading={trainerModalLoading}
      />

      {/* Upgrade Package Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={handleUpgradeDialogClose}>
        <DialogTitle>Upgrade Member Package</DialogTitle>
        <DialogContent>
          <div style={{ minWidth: 300, marginTop: 8 }}>
            <TextField
              select
              label="Select New Package"
              value={selectedPackageId}
              onChange={e => setSelectedPackageId(e.target.value)}
              fullWidth
              margin="normal"
            >
              {packages
                .filter(pkg => pkg.isActive !== false)
                .map(pkg => (
                  <MenuItem key={pkg.id} value={pkg.id}>{pkg.name} - {pkg.price} ETB</MenuItem>
                ))}
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpgradeDialogClose} disabled={upgradeLoading}>Cancel</Button>
          <Button onClick={handleUpgradeConfirm} variant="contained" color="primary" disabled={!selectedPackageId || upgradeLoading}>
            {upgradeLoading ? <CircularProgress size={20} /> : 'Upgrade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onClose={handleActionModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Actions for {selectedMemberForAction?.name}
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Buy Membership */}
            {selectedMemberForAction?.membershipStatus?.toLowerCase() !== 'active' && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => handleActionClick('buy')}
                startIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>}
              >
                Buy Membership
              </Button>
            )}

            {/* Freeze/Unfreeze */}
            {selectedMemberForAction?.membershipStatus?.toLowerCase() === 'active' && !selectedMemberForAction?.isFrozen && (
              <Button
                variant="contained"
                color="info"
                fullWidth
                onClick={() => handleActionClick('freeze')}
                startIcon={<Snowflake size={20} />}
              >
                Freeze Membership
              </Button>
            )}

            {selectedMemberForAction?.membershipStatus?.toLowerCase() === 'active' && selectedMemberForAction?.isFrozen && (
              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={() => handleActionClick('unfreeze')}
                startIcon={<Snowflake size={20} />}
              >
                Unfreeze Membership
              </Button>
            )}

            {/* Trainer Management */}
            {(() => {
              // Find the member's package to check if it requires a trainer
              const memberPackage = packages.find(pkg => pkg.name === selectedMemberForAction?.membership);
              const requiresTrainer = memberPackage?.requiresTrainer;
              
              return requiresTrainer && (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => handleActionClick('trainer')}
                  startIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 14v7m-7-7a7 7 0 0114 0" />
                  </svg>}
                >
                  Manage Trainer
                </Button>
              );
            })()}

            {/* QR Code */}
            {(selectedMemberForAction?.qrcodeData || selectedMemberForAction?.membershipStatus?.toLowerCase() === 'active') && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleActionClick('qr')}
                startIcon={<QrCode size={20} />}
              >
                View QR Code
              </Button>
            )}

            {/* Upgrade Package */}
            <Button
              variant="contained"
              color="warning"
              fullWidth
              onClick={() => handleActionClick('upgrade')}
              startIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>}
            >
              Upgrade Package
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionModalClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 
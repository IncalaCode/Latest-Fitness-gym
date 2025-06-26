import { useState, useEffect, useRef } from "react";
import useMembers from "../../../hooks/useMembers";
import { IMAGE_URL, API_URL } from "../../../config/config";
import { Phone, MapPin, AlertCircle, Calendar, UserPlus, QrCode, Snowflake } from "lucide-react";
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
  MenuItem
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MembersTab({ rowsPerPage = 10 }) {
  const {
    members,
    loading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    refetch,
    reassignOrRemoveTrainer
  } = useMembers(rowsPerPage);
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
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const memberFieldOptions = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'membership', label: 'Membership Type' },
    { id: 'membershipStatus', label: 'Membership Status' },
    { id: 'phone', label: 'Phone' },
    { id: 'emergencyContact', label: 'Emergency Contact' },
    { id: 'address', label: 'Address' },
    { id: 'birthYear', label: 'Birth Year' }
  ];
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    fields: memberFieldOptions.map(f => f.id)
  });

  const [trainerModalOpen, setTrainerModalOpen] = useState(false);
  const [trainerModalLoading, setTrainerModalLoading] = useState(false);

  // Upgrade package dialog state
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeMember, setUpgradeMember] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the standard lg breakpoint
    };

    // Check on initial load
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Function to handle buy button click
  const handleBuyClick = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    // Refresh the members list to show updated membership status
    refetch();
  };

  // Function to handle QR code button click
  const handleQrCodeClick = (member) => {
    setSelectedMember(member);
    setLoadingQrCode(true);

    try {
      // Use QR code data from the member object (from getAllUsers)
      if (member.qrcodeData) {
        setQrCodeData(member.qrcodeData);
      } else {
        // Create a fallback QR code with member information if no QR code data exists
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

    // Refresh the members list if the operation was successful
    if (success) {
      refetch();
    }
  };

  // Function to download QR code
  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;

    try {
      // Get the SVG element
      const svgElement = qrCodeRef.current.querySelector('svg');

      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions
      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = svgRect.width * 2; // Scale up for better quality
      canvas.height = svgRect.height * 2;

      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert SVG to a data URL instead of a blob
      const svgData = new XMLSerializer().serializeToString(svgElement);
      // Use TextEncoder and TextDecoder instead of unescape
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8');
      const svgBase64 = btoa(decoder.decode(encoder.encode(svgData)));
      const dataURL = 'data:image/svg+xml;base64,' + svgBase64;

      // Create an image from the data URL
      const img = new Image();
      img.onload = () => {
        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get data URL directly from canvas (uses data: scheme which is allowed by CSP)
        const pngDataUrl = canvas.toDataURL('image/png');

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl; // This is a data: URL, not a blob: URL
        downloadLink.download = `${selectedMember.name}-membership-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      // Set the source to the data URL
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
    // Convert to lowercase for comparison since backend sends lowercase values
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
    const isActive = member.membershipStatus && member.membershipStatus.toLowerCase() === 'active';
    const hasQrCode = member.qrcodeData || isActive; // Show QR button if active or has QR code data
    const isFrozen = member.isFrozen; // Check if membership is frozen

    return (
      <div className="flex flex-col gap-2">
        {/* First Row - Membership Management Buttons */}
        <div className="flex gap-1">
          {!isActive && (
            <button
              className="bg-green-500 text-white py-1 px-3 rounded-md cursor-pointer hover:bg-green-600 transition-colors flex items-center"
              onClick={() => handleBuyClick(member)}
              title="Buy membership"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Buy
            </button>
          )}
          {isActive && !isFrozen && (
            <button
              className="bg-cyan-500 text-white py-1 px-3 rounded-md cursor-pointer hover:bg-cyan-600 transition-colors flex items-center"
              onClick={() => handleFreezeClick(member, false)}
              title="Freeze membership"
            >
              <Snowflake size={14} className="mr-1" />
              Freeze
            </button>
          )}
          {isActive && isFrozen && (
            <button
              className="bg-orange-500 text-white py-1 px-3 rounded-md cursor-pointer hover:bg-orange-600 transition-colors flex items-center"
              onClick={() => handleFreezeClick(member, true)}
              title="Unfreeze membership"
            >
              <Snowflake size={14} className="mr-1" />
              Unfreeze
            </button>
          )}
          {/* Trainer reassign/remove button */}
          <button
            className="bg-purple-500 text-white py-1 px-3 rounded-md cursor-pointer hover:bg-purple-600 transition-colors flex items-center"
            onClick={() => handleTrainerModalOpen(member)}
            title="Reassign/Remove Trainer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 14v7m-7-7a7 7 0 0114 0" />
            </svg>
            Trainer
          </button>
        </div>

        {/* Second Row - QR Code and Upgrade Buttons */}
        <div className="flex gap-1">
          {/* QR Code Button */}
          {hasQrCode && (
            <button
              className="bg-blue-500 text-white py-1 px-3 rounded-md cursor-pointer hover:bg-blue-600 transition-colors flex items-center"
              onClick={() => handleQrCodeClick(member)}
              title="View QR code"
            >
              <QrCode size={14} className="mr-1" />
              QR Code
            </button>
          )}
          {/* Upgrade Package Button */}
          <button
            className="bg-yellow-500 text-white py-1 px-3 rounded-md cursor-pointer hover:bg-yellow-600 transition-colors flex items-center"
            onClick={() => handleUpgradeClick(member)}
            title="Upgrade Package"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Upgrade
          </button>
        </div>
      </div>
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

  const handleSort = (property) => {
    if (sortBy === property) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(property);
      setSortOrder('asc');
    }
  };

  const filteredMembers = members
    .filter(member => member.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

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
      const csv = arrayToCSV(filteredMembers, exportOptions.fields);
      downloadCSV(csv, 'members_export.csv');
    } else if (exportOptions.format === 'pdf') {
      const doc = new jsPDF();
      const tableData = filteredMembers.map(row =>
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
            Showing {members.length} of {totalPages * rowsPerPage} members
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
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Action</div>
                    <div className="flex flex-col gap-2">
                      {/* First Row - Membership Management Buttons */}
                      <div className="flex gap-1">
                        {member.membershipStatus?.toLowerCase() !== 'active' && (
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-green-600 transition-colors flex items-center"
                            onClick={() => handleBuyClick(member)}
                            title="Buy membership"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Buy
                          </button>
                        )}
                        {member.membershipStatus?.toLowerCase() === 'active' && !member.isFrozen && (
                          <button
                            className="bg-cyan-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-cyan-600 transition-colors flex items-center"
                            onClick={() => handleFreezeClick(member, false)}
                            title="Freeze membership"
                          >
                            <Snowflake size={16} className="mr-1" />
                            Freeze
                          </button>
                        )}
                        {member.membershipStatus?.toLowerCase() === 'active' && member.isFrozen && (
                          <button
                            className="bg-orange-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-orange-600 transition-colors flex items-center"
                            onClick={() => handleFreezeClick(member, true)}
                            title="Unfreeze membership"
                          >
                            <Snowflake size={16} className="mr-1" />
                            Unfreeze
                          </button>
                        )}
                        {/* Trainer reassign/remove button (mobile) */}
                        <button
                          className="bg-purple-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-purple-600 transition-colors flex items-center"
                          onClick={() => handleTrainerModalOpen(member)}
                          title="Reassign/Remove Trainer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 14v7m-7-7a7 7 0 0114 0" />
                          </svg>
                          Trainer
                        </button>
                      </div>

                      {/* Second Row - QR Code and Upgrade Buttons */}
                      <div className="flex gap-1">
                        {/* QR Code Button */}
                        {(member.qrcodeData || member.membershipStatus?.toLowerCase() === 'active') && (
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-blue-600 transition-colors flex items-center"
                            onClick={() => handleQrCodeClick(member)}
                            title="View QR code"
                          >
                            <QrCode size={16} className="mr-1" />
                            QR Code
                          </button>
                        )}
                        {/* Upgrade Package Button */}
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-yellow-600 transition-colors flex items-center"
                          onClick={() => handleUpgradeClick(member)}
                          title="Upgrade Package"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Upgrade
                        </button>
                      </div>
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
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <TextField
              label="Search by Name"
              variant="outlined"
              size="small"
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ minWidth: 250 }}
            />
          </Box>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                  Member
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'membership'}
                      direction={sortBy === 'membership' ? sortOrder : 'asc'}
                      onClick={() => handleSort('membership')}
                    >
                  Membership Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'membershipStatus'}
                      direction={sortBy === 'membershipStatus' ? sortOrder : 'asc'}
                      onClick={() => handleSort('membershipStatus')}
                    >
                  Membership Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Emergency Contact</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Birth Year</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
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
                    <TableCell>{renderActionButtons(member)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
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
            {memberFieldOptions.map((field) => (
              <FormControlLabel
                key={field.id}
                control={
                  <Checkbox
                    checked={exportOptions.fields.includes(field.id)}
                    onChange={(e) => {
                      const newFields = e.target.checked
                        ? [...exportOptions.fields, field.id]
                        : exportOptions.fields.filter(f => f !== field.id);
                      setExportOptions({...exportOptions, fields: newFields});
                    }}
                  />
                }
                label={field.label}
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
              {packages.map(pkg => (
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
    </div>
  );
}

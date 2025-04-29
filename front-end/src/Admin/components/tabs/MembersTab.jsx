import { useState, useEffect, useRef } from "react";
import useMembers from "../../../hooks/useMembers";
import { IMAGE_URL, API_URL } from "../../../config/config";
import { Phone, MapPin, AlertCircle, Calendar, UserPlus, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import { useSnackbar } from 'notistack';
import PackageModal from "./member modals/PackageModal";

export default function MembersTab({ rowsPerPage = 10 }) {
  const {
    members,
    loading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    refetch,
  } = useMembers(rowsPerPage);

  const [isMobile, setIsMobile] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const qrCodeRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

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

  // Function to download QR code
  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;
    
    // Get the SVG element
    const svgElement = qrCodeRef.current.querySelector('svg');
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create an image from the SVG
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width * 2; // Scale up for better quality
      canvas.height = img.height * 2;
      
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = `${selectedMember.name}-membership-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
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
          className={`px-3 py-1 mx-1 rounded ${
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
      <div className="flex justify-center mt-6 flex-wrap">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 mx-1 my-1 rounded ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Previous
        </button>

        {pages}

        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className={`px-3 py-1 mx-1 my-1 rounded ${
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
  const renderStatusBadge = (membershipStatus) => {
    // Convert to lowercase for comparison since backend sends lowercase values
    const status = typeof membershipStatus === 'string' ? membershipStatus.toLowerCase() : '';
    
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
    
    return (
      <div className="flex space-x-2">
        {!isActive && (
          <button
            className="bg-green-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-green-600 transition-colors"
            onClick={() => handleBuyClick(member)}
          >
            Buy
          </button>
        )}
        {hasQrCode && (
          <button
            className="bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 transition-colors flex items-center"
            onClick={() => handleQrCodeClick(member)}
          >
            <QrCode size={14} className="mr-1" />
            QR
          </button>
        )}
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
    <div className="p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">Members</h2>
        <div className="flex items-center space-x-4">
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
        </div>
      </div>

      {/* Mobile View - Card Layout */}
      {isMobile && (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow p-4">
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
                <div>{renderStatusBadge(member.membershipStatus)}</div>
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
                    <div className="flex space-x-2">
                      {member.membershipStatus?.toLowerCase() !== 'active' && (
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-green-600 transition-colors"
                          onClick={() => handleBuyClick(member)}
                        >
                          Buy
                        </button>
                      )}
                      {(member.qrcodeData || member.membershipStatus?.toLowerCase() === 'active') && (
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-600 transition-colors flex items-center"
                          onClick={() => handleQrCodeClick(member)}
                        >
                          <QrCode size={16} className="mr-1" />
                          QR
                        </button>
                      )}
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
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Member
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Membership Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Membership Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Phone
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Emergency Contact
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Address
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Birth Year
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
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
                  </td>
                  <td className="py-4 px-4 text-sm">{member.membership}</td>
                  <td className="py-4 px-4">
                    {renderStatusBadge(member.membershipStatus)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {member.phone}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {member.emergencyContact}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {member.address}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {member.birthYear}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {renderActionButtons(member)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && renderPagination()}

      {/* Package Modal */}
      <PackageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        member={selectedMember}
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
                  includeMargin={true}
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
    </div>
  );
}

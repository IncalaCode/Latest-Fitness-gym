import { useState, useEffect } from "react";
import useMembers from "../../../hooks/useMembers";
import { IMAGE_URL } from "../../../config/config";
import { ChevronRight, Phone, MapPin, AlertCircle, Calendar, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function MembersTab({ rowsPerPage = 10 }) {
  const {
    members,
    loading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    refetch
  } = useMembers(rowsPerPage);

  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the standard lg breakpoint
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Function to render pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
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
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
  const renderStatusBadge = (status) => (
    <span
      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
        status === "Active"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {status}
    </span>
  );

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
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-gray-500 text-sm">{member.email}</div>
                  </div>
                </div>
                <div>
                  {renderStatusBadge(member.status)}
                </div>
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
                    <div className="text-xs text-gray-500">Emergency Contact</div>
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
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">
                    {member.membershipType}
                  </div>
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
                  Status
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
                  <td className="py-4 px-4 text-sm">{member.membershipType}</td>
                  <td className="py-4 px-4">
                    {renderStatusBadge(member.status)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination controls */}
      {totalPages > 1 && renderPagination()}
    </div>
  );
}

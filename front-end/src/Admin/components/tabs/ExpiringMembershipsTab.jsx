
import { Bell } from "lucide-react";
import useExpiringMemberships from "../../../hooks/useExpiringMemberships";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

export default function ExpiringMembershipsTab() {
  const { expiringMemberships = [], loading, error, refreshMemberships, sendReminder } = useExpiringMemberships() || {};
  const [sendingReminder, setSendingReminder] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sending reminder
  const handleSendReminder = async (membershipId, memberName) => {
    try {
      setSendingReminder(membershipId);
      const result = await sendReminder(membershipId);
      
      if (result?.success) {
        enqueueSnackbar(`Reminder sent to ${memberName}`, { variant: 'success' });
      } else {
        enqueueSnackbar(result?.message || "Something went wrong", { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar("Failed to send reminder", { variant: 'error' });
      console.error("Error sending reminder:", error);
    } finally {
      setSendingReminder(null);
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded">
          <p>Error loading expiring memberships: {error}</p>
          <button 
            onClick={() => refreshMemberships && refreshMemberships()}
            className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 sm:px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ensure expiringMemberships is always an array
  const memberships = Array.isArray(expiringMemberships) ? expiringMemberships : [];
  const membershipCount = memberships.length;

  // Render a card for mobile view
  const renderMobileCard = (membership) => (
    <div key={membership?.id || Math.random()} className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900">{membership?.name || 'N/A'}</h3>
        <div 
          className={`px-2 py-1 text-xs leading-none font-semibold rounded-full ${
            (membership?.daysRemaining || 0) <= 1 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {(membership?.daysRemaining || 0) <= 1 ? 'Expires Tomorrow' : 'Expiring Soon'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-gray-500">Phone:</p>
          <p className="font-medium">{membership?.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Type:</p>
          <p className="font-medium">{membership?.membershipType || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Expires:</p>
          <p className="font-medium">{membership?.expirationDate || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Days left:</p>
          <p className="font-medium">{membership?.daysRemaining || 0} {(membership?.daysRemaining || 0) === 1 ? 'day' : 'days'}</p>
        </div>
      </div>
      
      <button 
        className={`w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
          sendingReminder === membership?.id
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
        onClick={() => membership?.id && handleSendReminder(membership.id, membership.name)}
        disabled={sendingReminder === membership?.id || !membership?.id}
      >
        {sendingReminder === membership?.id ? (
          <>
            <span className="animate-spin h-4 w-4 mr-1 border-b-2 border-gray-500 rounded-full"></span>
            Sending...
          </>
        ) : (
          <>
            <Bell className="h-4 w-4 mr-1" />
            Send Reminder
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">Expiring Memberships</h2>
        <span className="text-sm sm:text-base text-gray-500">
          {membershipCount} memberships expiring within 5 days
        </span>
      </div>

      {membershipCount === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          No memberships expiring in the next 5 days
        </div>
      ) : isMobile ? (
        // Mobile view - cards
        <div className="space-y-4">
          {memberships.map(renderMobileCard)}
        </div>
      ) : (
        // Desktop view - table
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Remaining
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberships.map((membership) => (
                <tr key={membership?.id || Math.random()}>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">
                    {membership?.name || 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {membership?.phone || 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {membership?.membershipType || 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {membership?.expirationDate || 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (membership?.daysRemaining || 0) <= 1 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {(membership?.daysRemaining || 0) <= 1 ? 'Expires Tomorrow' : 'Expiring Soon'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {membership?.daysRemaining || 0} {(membership?.daysRemaining || 0) === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    <button 
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                        sendingReminder === membership?.id
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                      onClick={() => membership?.id && handleSendReminder(membership.id, membership.name)}
                      disabled={sendingReminder === membership?.id || !membership?.id}
                    >
                      {sendingReminder === membership?.id ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-1 border-b-2 border-gray-500 rounded-full"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-1" />
                          Send Reminder
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { Bell } from "lucide-react";
import useExpiringMemberships from "../../../hooks/useExpiringMemberships";
import { useState } from "react";
import { useSnackbar } from "notistack";

export default function ExpiringMembershipsTab() {
  const { expiringMemberships = [], loading, error, refreshMemberships, sendReminder } = useExpiringMemberships() || {};
  const [sendingReminder, setSendingReminder] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

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
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading expiring memberships: {error}</p>
          <button 
            onClick={() => refreshMemberships && refreshMemberships()}
            className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-4 rounded"
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Expiring Memberships</h2>
        <span className="text-gray-500">
          {membershipCount} memberships expiring within 5 days
        </span>
      </div>

      {membershipCount === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No memberships expiring in the next 5 days
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Full Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Phone Number
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Membership Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Expiration Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Days Remaining
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
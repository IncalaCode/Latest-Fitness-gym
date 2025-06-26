import { useState } from 'react';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../../../../config/config';
import { useSnackbar } from 'notistack';
import { Calendar, Snowflake, AlertCircle } from 'lucide-react';

export default function FreezeModal({ isOpen, onClose, member, isFrozen = false }) {
  const [freezeEndDate, setFreezeEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isFrozen ? 'unfreeze' : 'freeze';
      const apiPath = `/admin/payment/${endpoint}`;

      // Make sure we have a valid paymentId
      if (!member || (!member.paymentId && !member.qrcodeData)) {
        throw new Error('Invalid payment information. Please try again.');
      }

      // Get paymentId either directly from member object or from QR code data
      const paymentId = member.paymentId ||
        (member.qrcodeData ? JSON.parse(member.qrcodeData).paymentId : null);

      if (!paymentId) {
        throw new Error('Payment ID not found. Please try again.');
      }

      const requestBody = isFrozen
        ? { paymentId }
        : { paymentId, freezeEndDate };

      // Get headers with authentication token
      const options = await GET_HEADER({ isJson: true });

      const response = await fetch(API_ENDPOINT_FUNCTION(apiPath), {
        method: 'POST',
        headers: options.headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }

      enqueueSnackbar(
        isFrozen
          ? 'Membership successfully unfrozen!'
          : 'Membership successfully frozen!',
        { variant: 'success' }
      );

      onClose(true); // Pass true to indicate success and trigger a refresh
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(error.message || 'An error occurred', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6">
        <button
          onClick={() => onClose(false)}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          aria-label="Close"
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-4">
            <Snowflake size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isFrozen ? 'Unfreeze Membership' : 'Freeze Membership'}
          </h2>
          <p className="text-gray-600 mt-1">
            {member?.name}'s membership
          </p>
          {member?.membershipExpiry && (
            <p className="text-sm text-gray-500 mt-1">
              Expires: {new Date(member.membershipExpiry).toLocaleDateString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {!isFrozen && (
            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">About freezing</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Freezing a membership pauses it temporarily. The membership will be automatically unfrozen on the specified date, and the expiry date will be extended by the frozen duration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <label htmlFor="freezeEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                Freeze Until (End Date)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="freezeEndDate"
                  name="freezeEndDate"
                  min={minDate}
                  value={freezeEndDate}
                  onChange={(e) => setFreezeEndDate(e.target.value)}
                  required
                  className="pl-10 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {isFrozen && (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-orange-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">About unfreezing</h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>
                      This will unfreeze the membership immediately. The expiry date will be extended by the duration the membership was frozen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="mr-4 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!isFrozen && !freezeEndDate)}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed
                ${isFrozen
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-cyan-500 hover:bg-cyan-600'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Snowflake size={16} className="mr-2" />
                  {isFrozen ? 'Unfreeze Membership' : 'Freeze Membership'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

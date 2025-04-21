import QRScannerComponent from "../QRScanner/QRScannerComponent";
import useQRVerification from "../../hooks/useQRVerification";

export default function CheckInsTab() {
  const { 
    verifyQRCode, 
    verificationResult, 
    loading, 
    error, 
    clearVerificationResult,
    clearError
  } = useQRVerification();

  // Handle successful QR scan
  const handleQRScan = async (data) => {
    if (data) {
      try {
        // Parse the QR data if it's a string
        const qrData = typeof data === 'string' ? JSON.parse(data) : data;
        await verifyQRCode(qrData);
      } catch (error) {
        console.error("Error parsing QR data:", error);
      }
    }
  };

  // Render verification result
  const renderVerificationResult = () => {
    if (!verificationResult) return null;

    const { data } = verificationResult;

    if (data.payment && data.payment.paymentstatus === 'pending') {
      // Render pending payment verification
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Payment Pending Approval</h3>
          <div className="mt-2 space-y-2">
            <p><span className="font-medium">Member:</span> {data.user.fullName}</p>
            <p><span className="font-medium">Email:</span> {data.user.email}</p>
            <p><span className="font-medium">Plan:</span> {data.payment.planTitle}</p>
            <p><span className="font-medium">Amount:</span> ${data.payment.amount}</p>
            <p><span className="font-medium">Payment Method:</span> {data.payment.paymentMethod}</p>
            <p><span className="font-medium">Date:</span> {new Date(data.payment.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Approve Payment
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Reject Payment
            </button>
          </div>
        </div>
      );
    } else if (data.checkIn) {
      // Render successful check-in
      return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Check-in Successful</h3>
          <div className="mt-2 space-y-2">
            <p><span className="font-medium">Member:</span> {data.user.fullName}</p>
            <p><span className="font-medium">Email:</span> {data.user.email}</p>
            <p><span className="font-medium">Membership:</span> {data.membership.planTitle}</p>
            <p><span className="font-medium">Expiry Date:</span> {new Date(data.membership.expiryDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Check-in Time:</span> {new Date(data.checkIn.checkInTime).toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={clearVerificationResult}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Scan Another
          </button>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800">Verification Successful</h3>
        <p>{verificationResult.message}</p>
        <button 
          onClick={clearVerificationResult}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Scan Another
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Member Check-ins</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={clearError}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <span className="ml-2">Processing QR code...</span>
          </div>
        ) : verificationResult ? (
          renderVerificationResult()
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Scan Member QR Code</h3>
            <p className="mb-4 text-gray-600">
              Scan a member's QR code to verify their membership or process a payment.
            </p>
            <QRScannerComponent onScan={handleQRScan} />
          </>
        )}
      </div>
    </div>
  );
}

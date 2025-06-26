import { RefreshCw, Snowflake, CheckCircle } from "lucide-react";
import QRScannerComponent from "../QRScanner/QRScannerComponent";
import useQRVerification from "../../hooks/useQRVerification";

export default function CheckInsTab() {
  const {
    verifyQRCode,
    unfreezePayment,
    verificationResult,
    loading,
    unfreezeLoading,
    unfreezeSuccess,
    error,
    clearVerificationResult,
    clearError,
    clearUnfreezeSuccess
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

  // Function to handle unfreezing a payment
  const handleUnfreezePayment = async (paymentId) => {
    try {
      // Store the QR data from the error message before unfreezing
      let qrData = null;
      if (error && error.includes('Membership is frozen')) {
        try {
          const errorDataStr = error.split('Error: ')[1];
          const errorData = JSON.parse(errorDataStr);
          qrData = errorData.qrData;
        } catch (parseError) {
          console.error('Error extracting QR data:', parseError);
        }
      }

      // Call the unfreeze payment function
      const result = await unfreezePayment(paymentId);

      // If unfreeze was successful and we have the QR data, verify it again
      if (result && result.success && qrData) {
        // Wait a short delay to ensure the backend has processed the unfreeze
        setTimeout(async () => {
          await verifyQRCode(qrData);
          clearUnfreezeSuccess(); // Clear the unfreeze success state
        }, 1000);
      }
    } catch (unfreezeError) {
      console.error("Error unfreezing payment:", unfreezeError);
    }
  };

  // Render verification result
  const renderVerificationResult = () => {
    // Handle loading states
    if (loading || unfreezeLoading) {
      return (
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-700 mr-3"></div>
          <span className="text-sm sm:text-base">
            {loading ? "Processing QR code..." : "Unfreezing membership..."}
          </span>
        </div>
      );
    }

    // Handle unfreeze success
    if (unfreezeSuccess) {
      return (
        <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-base sm:text-lg font-semibold text-green-800 flex items-center">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
            Membership Unfrozen
          </h3>
          <p className="mt-2 text-sm sm:text-base text-green-700">
            The membership has been successfully unfrozen. The member can now check in.
          </p>
          <button
            onClick={() => {
              clearUnfreezeSuccess();
              clearVerificationResult();
            }}
            className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base flex items-center justify-center w-full sm:w-auto"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Scan Another
          </button>
        </div>
      );
    }

    // Handle error states
    if (error) {
      // Check if this is a frozen membership error
      if (error.includes('Membership is frozen')) {
        try {
          // Extract the frozen membership data from the error message
          const errorDataStr = error.split('Error: ')[1];
          const errorData = JSON.parse(errorDataStr);

          return (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 flex items-center">
                <Snowflake className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                Membership is Frozen
              </h3>
              <div className="mt-2 space-y-1 sm:space-y-2">
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Frozen until:</span> {new Date(errorData.freezeEndDate).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={clearError}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base flex items-center justify-center w-full sm:w-auto"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Scan Another
                </button>
                <button
                  onClick={() => handleUnfreezePayment(errorData.paymentId)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
                >
                  Unfreeze Membership
                </button>
              </div>
            </div>
          );
        } catch (parseError) {
          console.error('Error parsing frozen membership data:', parseError);
        }
      }

      // Default error display
      return (
        <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-base sm:text-lg font-semibold text-red-800">Verification Failed</h3>
          <p className="mt-2 text-sm sm:text-base text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base flex items-center justify-center w-full sm:w-auto"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    // Handle verification result
    if (verificationResult) {
      const { data } = verificationResult;

      if (data.payment && data.payment.paymentstatus === 'pending') {
        // Render pending payment verification
        return (
          <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-800">Payment Pending Approval</h3>
            <div className="mt-2 space-y-1 sm:space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3">
                <p className="text-sm sm:text-base"><span className="font-medium">Member:</span> {data.user.fullName}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Email:</span> {data.user.email}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Plan:</span> {data.payment.planTitle}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Amount:</span> ${data.payment.amount}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Payment Method:</span> {data.payment.paymentMethod}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Date:</span> {new Date(data.payment.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto">
                Approve Payment
              </button>
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base w-full sm:w-auto">
                Reject Payment
              </button>
            </div>
          </div>
        );
      } else if (data.checkIn) {
        // Render successful check-in
        return (
          <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-green-800">Check-in Successful</h3>
            <div className="mt-2 space-y-1 sm:space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3">
                <p className="text-sm sm:text-base"><span className="font-medium">Member:</span> {data.user.fullName}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Email:</span> {data.user.email}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Membership:</span> {data.membership.planTitle}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Expiry Date:</span> {new Date(data.membership.expiryDate).toLocaleDateString()}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Check-in Time:</span> {new Date(data.checkIn.checkInTime).toLocaleTimeString()}</p>
              </div>
            </div>
            <button
              onClick={clearVerificationResult}
              className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base flex items-center justify-center w-full sm:w-auto"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Scan Another
            </button>
          </div>
        );
      }

      return (
        <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-base sm:text-lg font-semibold text-green-800">Verification Successful</h3>
          <p className="text-sm sm:text-base">{verificationResult.message}</p>
          <button
            onClick={clearVerificationResult}
            className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base flex items-center justify-center w-full sm:w-auto"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Scan Another
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div>
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base flex items-center w-full sm:w-auto justify-center"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-700"></div>
            <span className="ml-2 text-sm sm:text-base">Processing QR code...</span>
          </div>
        ) : verificationResult ? (
          renderVerificationResult()
        ) : (
          <>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Scan Member QR Code</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">
              Scan a member's QR code to verify their membership or process a payment.
            </p>
            <QRScannerComponent onScan={handleQRScan} />
          </>
        )}
      </div>
    </div>
  );
}

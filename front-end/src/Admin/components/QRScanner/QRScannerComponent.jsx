import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, RefreshCw, Loader } from "lucide-react";
import useQRVerification from "../../hooks/useQRVerification";

export default function QRScannerComponent() {
  const [inputValue, setInputValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);
  
  // Use the QR verification hook
  const { 
    verifyQRCode, 
    verificationResult, 
    loading, 
    error, 
    clearVerificationResult, 
    clearError 
  } = useQRVerification();

  // Auto-focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reset focus when scanning is reset
  useEffect(() => {
    if (!scanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanning]);

  // Handle QR code input
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Process QR code when Enter is pressed
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      processQRCode(inputValue);
    }
  };

  // Process QR code from input
  const processQRCode = async (qrData) => {
    try {
      setScanning(true);
      
      // Try to parse the QR data as JSON
      let parsedQRData;
      try {
        parsedQRData = JSON.parse(qrData);
      } catch (error) {
        // If not valid JSON, use as is
        parsedQRData = qrData;
      }

      // Use the hook to verify the QR code
      await verifyQRCode(parsedQRData);
    } catch (error) {
      console.error("QR verification error:", error);
    } finally {
      setScanning(false);
      setInputValue("");
    }
  };

  // Reset the scanner
  const resetScanner = () => {
    setInputValue("");
    clearVerificationResult();
    clearError();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render verification result
  const renderVerificationResult = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">Verifying QR code...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-700 mb-2">Verification Failed</p>
          <p className="text-center text-red-600 mb-4">{error}</p>
          <button
            onClick={resetScanner}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    if (verificationResult) {
      const { data } = verificationResult;
      
      if (data?.checkIn) {
        // Check-in successful
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium text-green-700 mb-2">Check-in Successful</p>
            <div className="bg-white p-4 rounded-lg shadow-sm w-full mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Member</p>
                  <p className="font-medium">{data.user?.fullName || ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-in Time</p>
                  <p className="font-medium">
                    {new Date(data.checkIn.checkInTime).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membership</p>
                  <p className="font-medium">{data.membership?.planTitle || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="font-medium">{data.membership?.expiryDate || 'N/A'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={resetScanner}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan Another
            </button>
          </div>
        );
      } else if (data?.payment) {
        // Payment pending approval
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-lg font-medium text-yellow-700 mb-2">Payment Pending Approval</p>
            <div className="bg-white p-4 rounded-lg shadow-sm w-full mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Member</p>
                  <p className="font-medium">{data.user?.fullName || ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{data.payment?.planTitle || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">${data.payment?.amount || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{data.payment?.paymentMethod || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetScanner}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan Another
              </button>
              <button
                onClick={() => {
                  // Navigate to pending approvals with this payment highlighted
                  window.location.href = `/admin/pending-approvals?highlight=${data.payment.id}`;
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Go to Approvals
              </button>
            </div>
          </div>
        );
      } else {
        // Generic success
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium text-green-700 mb-2">Verification Successful</p>
            <p className="text-center text-green-600 mb-4">{verificationResult.message}</p>
            <button
              onClick={resetScanner}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan Another
            </button>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">QR Code Scanner</h2>
          <p className="text-gray-600">Scan member QR codes for check-ins or payment verification</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="qrInput" className="block text-sm font-medium text-gray-700 mb-1">
              QR Code Input
            </label>
            <div className="flex">
              <input
                ref={inputRef}
                id="qrInput"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Scan QR code or enter code manually"
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                autoFocus
              />
              <button
                onClick={() => processQRCode(inputValue)}
                disabled={!inputValue.trim() || loading}
                className={`ml-3 px-4 py-2 rounded-md ${
                  !inputValue.trim() || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } transition-colors`}
              >
                {loading ? "Processing..." : "Verify"}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Position the QR code in front of the scanner or enter the code manually and press Enter
            </p>
          </div>

          <div className="flex items-center justify-center border-t border-gray-200 pt-4">
            <div className="text-center text-gray-500 text-sm w-full">
              {!loading && !verificationResult && !error ? (
                <p>Ready to scan</p>
              ) : (
                renderVerificationResult()
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Ensure the QR code is clearly visible and well-lit</li>
            <li>Hold the QR code steady in front of the scanner</li>
            <li>The system will automatically process valid QR codes</li>
            <li>For manual entry, type the code and press Enter</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
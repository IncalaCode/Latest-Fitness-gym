import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPrinter, FiCheckCircle, FiXCircle, FiAlertTriangle, FiMaximize, FiX } from 'react-icons/fi';
import { PrimaryButton } from '../../../components/ui/Buttons';
import { QRCodeSVG } from 'qrcode.react';

const CheckInCode = ({ userData, qrCodeData, hasPendingInCashPayment, paymentMessage, isRenewal, variants }) => {
  const [showFullscreenQR, setShowFullscreenQR] = useState(false);
  const [qrSize, setQrSize] = useState(240);
  
  // Calculate QR size based on screen dimensions
  useEffect(() => {
    const calculateQrSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const maxSize = Math.min(screenWidth * 0.8, screenHeight * 0.5);
      
      // Cap the size at 500px for larger screens
      return Math.min(maxSize, 500);
    };
    
    // Set initial size
    setQrSize(calculateQrSize());
    
    // Update size on window resize
    const handleResize = () => {
      setQrSize(calculateQrSize());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const hasActiveMembership = userData?.membershipStatus === 'Active';
  const isPendingApproval = userData?.membershipStatus === 'Pending Approval';
  const isExpired = userData?.membershipStatus === 'Expired';
  const generateQRValue = () => {
    if (qrCodeData) {
      return JSON.stringify(qrCodeData);
    }
    return `INVALID_${userData?.id || '12345'}`;
  };
  
  const navigateToRenewMembership = () => {
    window.location.href = "/package";
  };
  
  const handleShowToStaff = () => {
    setShowFullscreenQR(true);
  };

  const closeFullscreenQR = () => {
    setShowFullscreenQR(false);
  };

  return (
    <>
      <motion.div 
        className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center"
        variants={variants}
      >
      {/* Header - Changes based on membership status */}
      <div className="flex items-center mb-5">
        {hasActiveMembership ? (
          <FiCheckCircle className="text-green-500 mr-2 text-xl" />
        ) : isPendingApproval ? (
          <FiAlertTriangle className="text-yellow-500 mr-2 text-xl" />
        ) : isPendingApproval && !hasPendingInCashPayment ? (
          <>
            <p className="text-yellow-400 text-sm mb-2">
              {isRenewal 
                ? "Your online membership renewal payment is being processed."
                : "Your online membership payment is being processed."}
            </p>
            <p className="text-gray-300 text-xs">
              Please wait for confirmation. You'll be notified once your payment is approved.
            </p>
          </>
        ) : isExpired ? (
          <FiXCircle className="text-red-500 mr-2 text-xl" />
        ) : (
          <FiAlertTriangle className="text-yellow-500 mr-2 text-xl" />
        )}
        <h2 className="text-xl font-bold">
          {hasActiveMembership ? 'Check-In Code' : 
           isPendingApproval ? 'Pending Approval' : 
           isExpired ? 'Membership Expired' : 
           'Membership Inactive'}
        </h2>
      </div>
      
      {/* QR Code or Status Message */}
      <div className="flex justify-center items-center mb-6 w-full">
        {hasActiveMembership || (isPendingApproval && hasPendingInCashPayment) ? (
          // Active membership or pending in-cash payment - show QR code
          <div className={`bg-white p-4 rounded-lg ${isPendingApproval ? 'border-2 border-yellow-500' : ''}`}>
            <QRCodeSVG 
              value={generateQRValue()} 
              size={240} 
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
              includeMargin={true}
            />
          </div>
        ) : (
          // Expired, inactive, or pending online payment - show invalid QR with overlay
          <div className="relative">
            <div className="bg-white p-4 rounded-lg opacity-30">
              <QRCodeSVG 
                value={generateQRValue()} 
                size={240} 
                level="H"
                bgColor="#FFFFFF"
                fgColor="#000000"
                includeMargin={true}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-900 bg-opacity-80 rounded-full p-4">
                {isExpired ? (
                  <FiXCircle className="text-red-500 text-6xl" />
                ) : isPendingApproval ? (
                  <FiAlertTriangle className="text-yellow-500 text-6xl" />
                ) : (
                  <FiAlertTriangle className="text-yellow-500 text-6xl" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions or Status Message */}
      <div className="text-center mb-8 w-full max-w-xs">
        {hasActiveMembership ? (
          <>
            <p className="text-gray-300 text-sm mb-2">
              Scan this code at the reception to check in.
            </p>
            <p className="text-gray-400 text-xs">
              Your QR code refreshes every 24 hours for security.
            </p>
            {qrCodeData && qrCodeData.dailyCode && (
              <div className="mt-2 bg-gray-700 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1">Today's verification code:</p>
                <p className="text-white font-mono font-bold tracking-wider">{qrCodeData.dailyCode}</p>
              </div>
            )}
          </>
        ) : isPendingApproval && hasPendingInCashPayment ? (
          <>
            <p className="text-yellow-400 text-sm mb-2">
              {isRenewal 
                ? "Your membership renewal payment is pending approval."
                : "Your new membership payment is pending approval."}
            </p>
            <p className="text-gray-300 text-xs">
              Please show this QR code to the staff at reception to complete the payment process.
            </p>
            {qrCodeData && qrCodeData.dailyCode && (
              <div className="mt-2 bg-gray-700 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1">Verification code:</p>
                <p className="text-white font-mono font-bold tracking-wider">{qrCodeData.dailyCode}</p>
              </div>
            )}
          </>
        ) : isExpired ? (
          <>
            <p className="text-red-400 text-sm mb-2">
              Your membership has expired.
            </p>
            <p className="text-gray-400 text-xs">
              Please renew your membership to continue using our facilities.
            </p>
          </>
        ) : (
          <>
            <p className="text-yellow-400 text-sm mb-2">
              Your membership is currently inactive.
            </p>
            <p className="text-gray-400 text-xs">
              {paymentMessage || "Please purchase a membership plan to get started."}
            </p>
          </>
        )}
      </div>
      
      {/* Action Button - Changes based on membership status */}
      {hasActiveMembership ? (
        <PrimaryButton 
          colorScheme="redOrange" 
          className="w-full max-w-xs flex items-center justify-center"
        >
          <FiPrinter className="mr-2" /> Print QR Code
        </PrimaryButton>
      ) : isPendingApproval && hasPendingInCashPayment ? (
        <PrimaryButton 
          colorScheme="yellow" 
          className="w-full max-w-xs flex items-center justify-center"
          onClick={handleShowToStaff}
        >
          <FiMaximize className="mr-2" /> Show to Staff
        </PrimaryButton>
      ) : isPendingApproval && !hasPendingInCashPayment ? (
        <PrimaryButton 
          colorScheme="blueWhite" 
          className="w-full max-w-xs flex items-center justify-center"
          disabled
        >
          Processing Payment
        </PrimaryButton>
      ) : (
        <PrimaryButton 
          colorScheme={isExpired ? "redOrange" : "blueWhite"} 
          className="w-full max-w-xs flex items-center justify-center"
          onClick={navigateToRenewMembership} // Function to navigate to the membership renewal page
        >
          {isRenewal ? 'Renew Membership' : 'Join Now'}
        </PrimaryButton>
      )}
      </motion.div>

      {/* Fullscreen QR Code Modal */}
      <AnimatePresence>
        {showFullscreenQR && (
          <motion.div 
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={closeFullscreenQR}
                className="text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="flex flex-col items-center max-w-full">
              <div className="bg-white p-4 rounded-lg mb-6 border-4 border-yellow-500 max-w-full">
                <QRCodeSVG 
                  value={generateQRValue()} 
                  size={qrSize} 
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  includeMargin={true}
                />
              </div>
              
              {qrCodeData && qrCodeData.dailyCode && (
                <div className="bg-gray-800 rounded-lg p-4 text-center mb-6 w-full max-w-md">
                  <p className="text-gray-400 text-sm mb-1">Verification code:</p>
                  <p className="text-white font-mono font-bold tracking-wider text-3xl">{qrCodeData.dailyCode}</p>
                </div>
              )}
              
              <div className="text-center text-white max-w-md px-4">
                <h2 className="text-2xl font-bold mb-2">Pending Approval</h2>
                <p className="text-yellow-400 text-lg mb-2">
                  {isRenewal 
                    ? "Your membership renewal payment is pending approval."
                    : "Your new membership payment is pending approval."}
                </p>
                <p className="text-gray-300">
                  Please show this screen to the staff at reception to complete the payment process.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CheckInCode;

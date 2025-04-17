import React from 'react';
import { motion } from 'framer-motion';
import { FiPrinter, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import { PrimaryButton } from '../../../components/ui/Buttons';
import { QRCodeSVG } from 'qrcode.react';

const CheckInCode = ({ userData, variants }) => {
  // Check if user has active membership
  const hasActiveMembership = userData?.membershipStatus === 'Active';
  const isExpired = userData?.membershipStatus === 'Expired';
  
  return (
    <motion.div 
      className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center"
      variants={variants}
    >
      {/* Header - Changes based on membership status */}
      <div className="flex items-center mb-5">
        {hasActiveMembership ? (
          <FiCheckCircle className="text-green-500 mr-2 text-xl" />
        ) : isExpired ? (
          <FiXCircle className="text-red-500 mr-2 text-xl" />
        ) : (
          <FiAlertTriangle className="text-yellow-500 mr-2 text-xl" />
        )}
        <h2 className="text-xl font-bold">
          {hasActiveMembership ? 'Check-In Code' : isExpired ? 'Membership Expired' : 'Membership Inactive'}
        </h2>
      </div>
      
      {/* QR Code or Status Message */}
      <div className="flex justify-center items-center mb-6 w-full">
        {hasActiveMembership ? (
          // Active membership - show valid QR code
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG 
              value={`LATEST_FITNESS_CHECKIN_${userData?.id || '12345'}`} 
              size={240} 
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
              includeMargin={true}
            />
          </div>
        ) : (
          // Expired or inactive membership - show invalid QR with overlay
          <div className="relative">
            <div className="bg-white p-4 rounded-lg opacity-30">
              <QRCodeSVG 
                value={`INVALID_${userData?.id || '12345'}`} 
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
              Please contact reception to activate your membership.
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
      ) : (
        <PrimaryButton 
          colorScheme={isExpired ? "redOrange" : "blueWhite"} 
          className="w-full max-w-xs flex items-center justify-center"
        >
          {isExpired ? 'Renew Membership' : 'Contact Reception'}
        </PrimaryButton>
      )}
    </motion.div>
  );
};

export default CheckInCode;

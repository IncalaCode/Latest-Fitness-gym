"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSnackbar } from 'notistack';
import { QRCodeSVG } from 'qrcode.react';
import PackageOption from "./PackageOption";
import ConfirmationModal from "./ConfirmationModal";
import { API_URL, GET_HEADER } from "../../../../config/config";
import usePackages from '../../../hooks/usePackages';
import useTrainers from '../../../hooks/useTrainers';

export default function PackageModal({ isOpen, onClose, member }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState("group");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const qrCodeRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const { packages } = usePackages();
  const { trainers } = useTrainers();
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [requiresTrainer, setRequiresTrainer] = useState(false);
  const [packageId, setPackageId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPackage = (packageType, duration, price, gender) => {
    // Find the full package object by type and duration
    const pkg = packages.find(
      p => p.name === packageType &&
        ((p.duration && duration && String(p.duration).includes(duration.split(' ')[0])) || p.duration === duration)
    );
    setSelectedPackage({
      type: packageType,
      duration,
      price,
      gender: 'men',
    });
    setRequiresTrainer(pkg?.requiresTrainer || false);
    setPackageId(pkg?.id || null);
    setShowConfirmation(true);
  };

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;
    
    try {
      // Get the SVG element
      const svgElement = qrCodeRef.current.querySelector('svg');
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions based on the SVG size
      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = svgRect.width * 2; // Scale up for better quality
      canvas.height = svgRect.height * 2;
      
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Convert SVG to a data URL instead of a blob
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
      const dataURL = 'data:image/svg+xml;base64,' + svgBase64;
      
      // Create an image from the data URL
      const img = new Image();
      img.onload = () => {
        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get data URL directly from canvas (uses data: scheme which is allowed by CSP)
        const pngDataUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl; // This is a data: URL, not a blob: URL
        downloadLink.download = `${member.name}-membership-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      // Set the source to the data URL
      img.src = dataURL;
      
    } catch (error) {
      console.error("Error downloading QR code:", error);
      enqueueSnackbar("Failed to download QR code. Please try again.", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    }
  };

  const handleConfirm = async () => {
    try {
      // Get the basic duration components
      const durationValue = selectedPackage.duration.split(" ")[0]; // Get the number part
      const durationUnit = selectedPackage.duration.split(" ")[1].toLowerCase(); // Get the unit part

      // Handle special cases for certain packages
      let formattedDuration;

      // Special case: Personalized Package - 6 Month (add 15 days free)
      if (
        selectedPackage.type === "Personalized Package" &&
        selectedPackage.duration === "6 Month"
      ) {
        formattedDuration = "6m15d";
      }
      // Special case: Personalized Package - 12 Month (add 1 month free)
      else if (
        selectedPackage.type === "Personalized Package" &&
        selectedPackage.duration === "12 Month"
      ) {
        formattedDuration = "1y1m";
      }
      // Special case: Individual Package - 6 Month (add 15 days free)
      else if (
        selectedPackage.type === "Individual Package" &&
        selectedPackage.duration === "6 Month"
      ) {
        formattedDuration = "6m15d";
      }
      // Special case: Individual Package - 12 Month (add 1 month free)
      else if (
        selectedPackage.type === "Individual Package" &&
        selectedPackage.duration === "12 Month"
      ) {
        formattedDuration = "1y1m";
      }
      // Default case: standard duration formatting
      else {
        if (durationUnit.startsWith("month")) {
          formattedDuration = `${durationValue}m`;
        } else if (
          durationUnit.startsWith("year") ||
          durationUnit.startsWith("12 month")
        ) {
          formattedDuration = `${durationValue}y`;
        } else if (durationUnit.startsWith("day")) {
          formattedDuration = `${durationValue}d`;
        } else if (durationUnit.startsWith("week")) {
          formattedDuration = `${durationValue}w`;
        } else if (durationUnit.startsWith("hour")) {
          formattedDuration = `${durationValue}h`;
        }
      }

      // Remove commas from price and convert to number
      const cleanAmount = selectedPackage.price.replace(/,/g, "");

      // Prepare the data to send
      const paymentData = {
        userId: member.id,
        planTitle: `${selectedPackage.type} - ${selectedPackage.duration}`,
        amount: Number(cleanAmount),
        gender: selectedPackage.gender,
        duration: formattedDuration,
        packageId: packageId,
      };

      console.log("Sending payment data:", paymentData);
      const headerConfig = await GET_HEADER({ isJson: true });

      // Send the data to the API using fetch instead of axios
      const response = await fetch(`${API_URL}/payment/adminPayment`, {
        method: 'POST',
        headers: headerConfig.headers,
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Payment successful:", data);

      // Show success message using notistack
      enqueueSnackbar('Payment processed successfully!', { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });

      // Set QR code data from the response
      if (data.qrCodeData) {
        setQrCodeData(JSON.stringify(data.qrCodeData));
        setShowQrCode(true);
        setShowConfirmation(false);
      } else {
        setQrCodeData(JSON.stringify({
          ...data.qrCodeData
        }));
        setShowQrCode(true);
        setShowConfirmation(false);
      }

      // If trainer assignment is required, assign the trainer after payment
      if (requiresTrainer && selectedTrainer) {
        try {
          const assignHeader = await GET_HEADER({ isJson: true });
          await fetch(`${API_URL}/trainers/assign-member`, {
            method: 'POST',
            headers: assignHeader.headers,
            body: JSON.stringify({
              memberId: member.id,
              trainerId: selectedTrainer
            })
          });
        } catch (err) {
          enqueueSnackbar('Failed to assign trainer. Please try again.', {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            }
          });
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      
      // Show error message using notistack
      enqueueSnackbar('Error processing payment. Please try again.', { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleCloseQrCode = () => {
    setShowQrCode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {showQrCode ? (
        <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6">
          <button
            onClick={handleCloseQrCode}
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
              {member.name}'s membership has been activated
            </p>
          </div>
          
          <div 
            ref={qrCodeRef}
            className="flex justify-center items-center bg-white p-4 rounded-lg shadow-inner mb-6"
          >
            <QRCodeSVG
              value={qrCodeData}
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
          </div>
          
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              Scan this QR code to verify membership
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={downloadQRCode}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
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
      ) : (
        <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
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

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-t-xl p-6 text-white">
          <h2 className="text-2xl font-bold">Membership Packages</h2>
          <p className="mt-1 opacity-90">Select a package for {member?.name}</p>
        </div>

        {/* Package list (no tabs, no grouping) */}
        <div className="max-h-[60vh] overflow-y-auto p-6 grid gap-6 md:grid-cols-3">
          {packages.map(pkg => (
              <PackageOption
              key={pkg.id}
              title={pkg.name}
              prices={{ men: pkg.price, women: pkg.price }}
                member={member}
                onSelect={handleSelectPackage}
              packageType={pkg.name}
              duration={pkg.duration ? `${pkg.duration} Month` : pkg.name}
              featured={pkg.tags?.includes('featured')}
              accessLevel={pkg.accessLevel}
              benefits={pkg.benefits}
              />
          ))}
        </div>
        </div>
      )}

      {showConfirmation && (
        <ConfirmationModal
          packageDetails={selectedPackage}
          member={member}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirmation}
          requiresTrainer={requiresTrainer}
          trainers={trainers}
          selectedTrainer={selectedTrainer}
          setSelectedTrainer={setSelectedTrainer}
        />
      )}
    </div>
  );
}

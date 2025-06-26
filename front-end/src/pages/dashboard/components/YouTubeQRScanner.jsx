import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiYoutube, FiUpload, FiCamera, FiAlertCircle, FiInfo, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { PrimaryButton, OutlineButton } from '../../../components/ui/Buttons';

const YouTubeQRScanner = ({ onClose, isOpen }) => {
  const [scanning, setScanning] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [videoTitle, setVideoTitle] = useState('YouTube Video');
  const [error, setError] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (scanAttempts > 0) {
      const timer = setTimeout(() => {
        setScanAttempts(0);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [scanAttempts]);

  useEffect(() => {
    if (isOpen) {
      setVideoUrl(null);
      setEmbedUrl(null);
      setVideoTitle('Video');
      setError(null);
      setCameraError(false);
      setShowImageUpload(false);
      setScanAttempts(0);
      checkCameraAvailability();
    }

    return () => {
      stopScanner();
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.clear();
        } catch (err) {
          console.error("Error clearing scanner:", err);
        }
        html5QrCodeRef.current = null;
      }
    };
  }, [isOpen]);

  const checkCameraAvailability = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      initializeScanner();
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(true);
      setShowImageUpload(true);
      setError("Camera access denied or not available. Please use image upload instead.");
    }
  };

  const initializeScanner = () => {
    if (scannerRef.current && !html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
        console.log("Scanner initialized successfully");
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setCameraError(true);
        setShowImageUpload(true);
        setError("Failed to initialize scanner. Please try the image upload option.");
      }
    }
  };

  const startScanner = () => {
    if (!html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setError("Scanner not initialized. Please try the image upload option.");
        setShowImageUpload(true);
        setCameraError(true);
        return;
      }
    }

    setScanning(true);
    setError(null);
    setVideoUrl(null);
    setEmbedUrl(null);

    const config = {
      fps: 10, // Lower fps for better performance
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      console.error("Scanner start error:", err);
      let errorMessage = "Failed to start scanner.";
      if (err.toString().includes("NotReadableError")) {
        errorMessage = "Camera is being used by another application or not working properly.";
      } else if (err.toString().includes("NotAllowedError")) {
        errorMessage = "Camera access denied. Please grant permission.";
      } else if (err.toString().includes("NotFoundError")) {
        errorMessage = "No camera found on this device.";
      }

      setError(errorMessage);
      setScanning(false);
      setCameraError(true);
      setShowImageUpload(true);
    });
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && scanning) {
      html5QrCodeRef.current.stop().then(() => {
        console.log("Scanner stopped successfully");
        setScanning(false);
      }).catch(err => {
        console.error("Failed to stop scanner:", err);
        setScanning(false);
      });
    } else {
      setScanning(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    console.log("QR Code detected:", decodedText);
    stopScanner();
    
    // Validate if it's a YouTube URL
    if (isYouTubeUrl(decodedText)) {
      setVideoUrl(decodedText);
      
      // Convert to embed URL
      const embedUrl = convertToEmbedUrl(decodedText);
      if (embedUrl) {
        setEmbedUrl(embedUrl);
        setVideoTitle('YouTube Video');
        setError(null);
      } else {
        setError("Failed to process YouTube URL. Please try again.");
        setVideoUrl(null);
      }
    } else {
      setError("The scanned QR code is not a valid YouTube URL. Please try again.");
      setVideoUrl(null);
      setEmbedUrl(null);
    }
  };

  const convertToEmbedUrl = (url) => {
    try {
      // Handle youtu.be format
      if (url.includes('youtu.be')) {
        const videoId = url.split('/').pop().split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Handle youtube.com format
      const parsedUrl = new URL(url);
      const videoId = parsedUrl.searchParams.get('v');
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // If we can't parse it properly, return null
      return null;
    } catch (e) {
      console.error("Error converting to embed URL:", e);
      return null;
    }
  };

  const isYouTubeUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname === 'www.youtube.com' || 
        parsedUrl.hostname === 'youtube.com' || 
        parsedUrl.hostname === 'youtu.be'
      );
    } catch (e) {
      return false;
    }
  };

  const onScanFailure = (error) => {
    // Only log to console to avoid UI clutter
    console.log("QR scan failure:", error);
    
    if (error && error.includes && error.includes("NotFoundException")) {
      setScanAttempts(prev => prev + 1);
      if (scanAttempts > 5 && !error) {
        setError("Having trouble finding a QR code? Make sure the QR code is well-lit and centered in the camera view.");
      }
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("Processing image...");
    setVideoUrl(null);
    setEmbedUrl(null);

    // Create a temporary scanner or use existing one
    let tempScanner;
    if (html5QrCodeRef.current) {
      tempScanner = html5QrCodeRef.current;
    } else {
      try {
        tempScanner = new Html5Qrcode("file-scanner");
      } catch (err) {
        console.error("Failed to create scanner for file:", err);
        setError("Failed to initialize scanner for file upload. Please try again.");
        return;
      }
    }

    tempScanner.scanFile(file, true)
      .then(decodedText => {
        console.log("File scan result:", decodedText);
        if (isYouTubeUrl(decodedText)) {
          setError(null);
          // Process the URL directly instead of calling onScanSuccess to avoid stopping a scanner that might not be running
          setVideoUrl(decodedText);
          const embedUrl = convertToEmbedUrl(decodedText);
          if (embedUrl) {
            setEmbedUrl(embedUrl);
            setVideoTitle('YouTube Video');
          } else {
            setError("Failed to process YouTube URL. Please try again.");
            setVideoUrl(null);
          }
        } else {
          setError("The scanned QR code is not a valid YouTube URL. Please try again.");
        }
        
        // Only clear if it's a temporary scanner
        if (tempScanner !== html5QrCodeRef.current) {
          try {
            tempScanner.clear();
          } catch (err) {
            console.error("Error clearing temporary scanner:", err);
          }
        }
      })
      .catch(err => {
        console.error("QR code scan error:", err);
        if (err.toString().includes("NotFoundException")) {
          setError("No QR code found in the image. Please try a clearer image.");
        } else {
          setError("Could not decode QR code. Make sure the image contains a clear QR code.");
        }
        
        // Only clear if it's a temporary scanner
        if (tempScanner !== html5QrCodeRef.current) {
          try {
            tempScanner.clear();
          } catch (err) {
            console.error("Error clearing temporary scanner:", err);
          }
        }
      });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const toggleScanMethod = () => {
    if (scanning) stopScanner();
    setShowImageUpload(!showImageUpload);
    setError(null);
  };

  const openYouTubeLink = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // FIXED scanAgain function to properly reset for both camera and upload modes
  const scanAgain = () => {
    // First stop any active scanner
    stopScanner();
    
    // Reset all video-related state
    setVideoUrl(null);
    setEmbedUrl(null);
    setError(null);
    setScanAttempts(0);
    
    // Clear the file input if it exists
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Reset the scanner if needed
    if (html5QrCodeRef.current) {
      try {
        // Stop the scanner first (redundant but safe)
        html5QrCodeRef.current.stop().catch(err => {
          console.error("Error stopping scanner during reset:", err);
        });
        
        // Clear the scanner instance
        html5QrCodeRef.current.clear().catch(err => {
          console.error("Error clearing scanner during reset:", err);
        });
        
        // Set to null to force re-initialization
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Error resetting scanner:", err);
      }
    }
    
    // Small delay to ensure DOM is updated before restarting
    setTimeout(() => {
      // Re-initialize the scanner
      initializeScanner();
      
      // If in camera mode, restart the scanner
      if (!showImageUpload && !cameraError) {
        startScanner();
      }
    }, 300);
    
    console.log("Scanner reset complete. Mode:", showImageUpload ? "Image Upload" : "Camera");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-4 right-4">
            <button
              onClick={handleClose}
              className="text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className={`bg-gray-800 rounded-xl ${embedUrl && isMobile ? 'p-3' : 'p-6'} w-full max-w-xl ${embedUrl && isMobile ? 'max-w-full' : ''}`}>
            {/* Only show header when not showing video on mobile */}
            {!(embedUrl && isMobile) && (
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FiYoutube className="mr-2 text-red-500" /> QR Scanner
              </h2>
            )}

            {!videoUrl ? (
              <>
                {!showImageUpload ? (
                  <>
                    <div
                      id="qr-reader"
                      ref={scannerRef}
                      className="w-full h-80 bg-gray-700 rounded-lg mb-4 overflow-hidden"
                    ></div>
                    {scanning && scanAttempts > 3 && !error && (
                      <div className="bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-300 p-3 rounded-lg mb-4 flex items-start">
                        <FiInfo className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>Point your camera at a YouTube QR code. Make sure it's well-lit and centered.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-80 bg-gray-700 rounded-lg mb-4 flex flex-col items-center justify-center">
                    <FiUpload size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-300 mb-4 text-center">Upload a QR code image</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div id="file-scanner" style={{ display: 'none' }}></div>
                    <PrimaryButton onClick={triggerFileInput} colorScheme="blueWhite">
                      Select Image
                    </PrimaryButton>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 flex items-start">
                    <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {!showImageUpload ? (
                    !scanning ? (
                      <PrimaryButton onClick={startScanner} colorScheme="redOrange" className="col-span-2">
                        Start Scanning
                      </PrimaryButton>
                    ) : (
                      <PrimaryButton onClick={stopScanner} colorScheme="blueWhite" className="col-span-2">
                        Stop Scanning
                      </PrimaryButton>
                    )
                  ) : (
                    <PrimaryButton onClick={triggerFileInput} colorScheme="redOrange" className="col-span-2">
                      Upload QR Image
                    </PrimaryButton>
                  )}
                </div>

                {!cameraError && (
                  <div className="flex justify-center">
                    <button
                      onClick={toggleScanMethod}
                      className="text-sm text-gray-400 hover:text-white flex items-center transition-colors"
                    >
                      {showImageUpload ? (
                        <>
                          <FiCamera className="mr-1" /> Switch to Camera
                        </>
                      ) : (
                        <>
                          <FiUpload className="mr-1" /> Switch to Image Upload
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="animate-fadeIn">
                {embedUrl ? (
                  <>
                    {/* Enhanced video container with better mobile responsiveness */}
                    <div className={`w-full ${isMobile ? 'mb-3' : 'mb-6'}`}>
                      {/* Responsive container for the iframe with improved mobile sizing */}
                      <div 
                        className={`relative w-full overflow-hidden rounded-lg ${isMobile ? 'fixed-aspect-ratio' : ''}`} 
                        style={isMobile ? {
                          paddingTop: '75%', // Higher aspect ratio on mobile for bigger video
                          height: 'auto',
                          maxHeight: '70vh' // Limit height on mobile
                        } : { 
                          paddingTop: '56.25%' // Standard 16:9 aspect ratio for desktop
                        }}
                      >
                        <iframe
                          src={embedUrl}
                          title="YouTube video player"
                          className="absolute top-0 left-0 w-full h-full"
                          style={{ 
                            minHeight: isMobile ? '250px' : '300px',
                            border: 'none'
                          }}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    
                    {/* Buttons below the video - stacked on mobile for better touch targets */}
                    <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-4'}`}>
                      <PrimaryButton 
                        onClick={openYouTubeLink} 
                        colorScheme="redOrange"
                        className={`flex items-center justify-center ${isMobile ? 'py-3' : ''}`}
                      >
                        <FiExternalLink className="mr-2" /> Open in YouTube
                      </PrimaryButton>
                      
                      <PrimaryButton 
                        onClick={scanAgain} 
                        colorScheme="blueWhite"
                        className={`flex items-center justify-center ${isMobile ? 'py-3' : ''}`}
                      >
                        <FiRefreshCw className="mr-2" /> Scan Another
                      </PrimaryButton>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-3">
                      <FiYoutube className="text-red-500 mr-2" size={24} />
                      <h3 className="text-lg font-medium text-white">{videoTitle}</h3>
                    </div>
                    
                    <p className="text-gray-300 mb-4 break-all">
                      {videoUrl}
                    </p>
                    
                    <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-3'}`}>
                      <PrimaryButton 
                        onClick={openYouTubeLink} 
                        colorScheme="redOrange"
                        className={`flex items-center justify-center ${isMobile ? 'py-3' : ''}`}
                      >
                        <FiExternalLink className="mr-2" /> Open Video
                      </PrimaryButton>
                      <PrimaryButton 
                        onClick={scanAgain} 
                        colorScheme="blueWhite"
                        className={`flex items-center justify-center ${isMobile ? 'py-3' : ''}`}
                      >
                        <FiRefreshCw className="mr-2" /> Scan Another
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default YouTubeQRScanner;
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
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

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
      setScanAttempts(0)
      checkCameraAvailability();
    }

    return () => {
      stopScanner();
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.clear();
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
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setCameraError(true);
        setShowImageUpload(true);
      }
    }
  };

  const startScanner = () => {
    if (!html5QrCodeRef.current) {
      setError("Scanner not initialized. Please try the image upload option.");
      setShowImageUpload(true);
      return;
    }

    setScanning(true);
    setError(null);
    setVideoUrl(null);
    setEmbedUrl(null);

    const config = {
      fps: 24,
      qrbox: { width: 400, height: 500 },
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
    stopScanner();
    
    // Validate if it's a YouTube URL
    if (isYouTubeUrl(decodedText)) {
      setVideoUrl(decodedText);
      
      // Convert to embed URL
      const embedUrl = convertToEmbedUrl(decodedText);
      setEmbedUrl(embedUrl);
      
      setVideoTitle('YouTube Video');
      setError(null);
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
    if (error.includes("NotFoundException")) {
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

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const imageUrl = e.target.result;
      const html5QrcodeScanner = new Html5Qrcode("file-scanner");

      html5QrcodeScanner.scanFile(file)
        .then(decodedText => {
          if (isYouTubeUrl(decodedText)) {
            setError(null);
            onScanSuccess(decodedText);
          } else {
            setError("The scanned QR code is not a valid YouTube URL. Please try again.");
          }
          html5QrcodeScanner.clear();
        })
        .catch(err => {
          console.error("QR code scan error:", err);
          if (err.toString().includes("NotFoundException")) {
            setError("No QR code found in the image. Please try a clearer image.");
          } else {
            setError("Could not decode QR code. Make sure the image contains a clear QR code.");
          }
          html5QrcodeScanner.clear();
        });
    };
    fileReader.readAsDataURL(file);
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

  const scanAgain = () => {
    setVideoUrl(null);
    setEmbedUrl(null);
    setError(null);
    if (!showImageUpload) {
      startScanner();
    }
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

          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FiYoutube className="mr-2 text-red-500" /> QR Scanner
            </h2>

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
                    <div className="w-full mb-6">
                      {/* Responsive container for the iframe */}
                      <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: '56.25%' }}>
                        <iframe
                          src={embedUrl}
                          title="YouTube video player"
                          className="absolute top-0 left-0 w-full h-full"
                          style={{ minHeight: '300px' }}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    
                    {/* Buttons below the video */}
                    <div className="grid grid-cols-2 gap-4">
                      <PrimaryButton 
                        onClick={openYouTubeLink} 
                        colorScheme="redOrange"
                        className="flex items-center justify-center"
                      >
                        <FiExternalLink className="mr-2" /> Open in YouTube
                      </PrimaryButton>
                      
                      <PrimaryButton 
                        onClick={scanAgain} 
                        colorScheme="blueWhite"
                        className="flex items-center justify-center"
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
                    
                    <div className="grid grid-cols-2 gap-3">
                      <PrimaryButton 
                        onClick={openYouTubeLink} 
                        colorScheme="redOrange"
                        className="flex items-center justify-center"
                      >
                        <FiExternalLink className="mr-2" /> Open Video
                      </PrimaryButton>
                      <PrimaryButton 
                        onClick={scanAgain} 
                        colorScheme="blueWhite"
                        className="flex items-center justify-center"
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

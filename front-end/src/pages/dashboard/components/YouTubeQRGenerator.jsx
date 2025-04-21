import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiYoutube, FiDownload, FiLink } from 'react-icons/fi';
import { PrimaryButton } from '../../../components/ui/Buttons';
import { QRCodeSVG } from 'qrcode.react';

const YouTubeQRGenerator = ({ onClose, isOpen }) => {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const qrRef = useRef(null);

  // Validate if the URL is a YouTube URL
  const validateUrl = (inputUrl) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(inputUrl);
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setIsValidUrl(validateUrl(inputUrl));
  };

  // Handle URL paste from clipboard
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setUrl(clipboardText);
      setIsValidUrl(validateUrl(clipboardText));
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  // Download QR code as PNG
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    // Set canvas dimensions to match SVG
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      
      // Create a filename based on the video ID or URL
      let filename = 'youtube-qr-code.png';
      try {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) {
          filename = `youtube-${videoId}.png`;
        }
      } catch (e) {
        // Use default filename if URL parsing fails
      }
      
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
              onClick={onClose}
              className="text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FiYoutube className="mr-2 text-red-500" /> YouTube QR Generator
            </h2>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">YouTube URL</label>
              <div className="flex">
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`bg-gray-700 text-white px-3 py-2 rounded-l-lg w-full focus:outline-none focus:ring-2 ${
                    isValidUrl ? 'focus:ring-blue-500' : 'focus:ring-red-500 border-red-500 border'
                  }`}
                />
                <button
                  onClick={handlePaste}
                  className="bg-gray-600 text-white px-3 py-2 rounded-r-lg hover:bg-gray-500"
                  title="Paste from clipboard"
                >
                  <FiLink />
                </button>
              </div>
              {!isValidUrl && (
                <p className="text-red-400 text-sm mt-1">
                  Please enter a valid YouTube URL
                </p>
              )}
            </div>

            <div 
              ref={qrRef}
              className="bg-white p-6 rounded-lg flex justify-center items-center mb-4"
            >
              <QRCodeSVG 
                value={url} 
                size={200} 
                level="H" 
                includeMargin={true}
                imageSettings={{
                  src: "https://www.youtube.com/favicon.ico",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PrimaryButton
                onClick={downloadQRCode}
                colorScheme="blueWhite"
                className="flex items-center justify-center"
              >
                <FiDownload className="mr-2" /> Download QR
              </PrimaryButton>
              
              <PrimaryButton
                onClick={onClose}
                colorScheme="redOrange"
              >
                Close
              </PrimaryButton>
            </div>
            
            <div className="mt-4 text-center text-gray-400 text-sm">
              <p>Use this QR code to test your YouTube QR Scanner</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default YouTubeQRGenerator;
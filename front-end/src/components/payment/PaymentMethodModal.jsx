import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import { BsBank } from 'react-icons/bs';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Payment method images
import chapaLogo from '/home/payment/chapa.png';
import cashIcon from '/home/payment/incash.png';

// Bank logos
import cbeIcon from '/home/payment/chapa.png';
import telebirrIcon from '/home/payment/chapa.png';
import awashIcon from '/home/payment/chapa.png';
import abissiniaIcon from '/home/payment/chapa.png';

const bankAccounts = [
  {
    id: 'cbe',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    accountNumber: '1000123456789',
    icon: cbeIcon
  },
  {
    id: 'telebirr',
    bankName: 'Telebirr',
    accountNumber: '0912345678',
    icon: telebirrIcon
  },
  {
    id: 'awash',
    bankName: 'Awash Bank',
    accountNumber: '0987654321001',
    icon: awashIcon
  },
  {
    id: 'abissinia',
    bankName: 'Abyssinia Bank',
    accountNumber: '0123456789012',
    icon: abissiniaIcon
  }
  // Add more banks here as needed
];

const BankAccountItem = ({ bankName, accountNumber, icon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-md mb-2">
      <div className="flex items-center">
        <img src={icon} alt={bankName} className="w-6 h-6 mr-2" />
        <div>
          <p className="text-sm text-gray-300">{bankName}</p>
          <p className="text-white font-medium">{accountNumber}</p>
        </div>
      </div>
      <button 
        onClick={handleCopy} 
        className="text-gray-400 hover:text-white transition-colors"
        title="Copy account number"
      >
        {copied ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
      </button>
    </div>
  );
};

const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  onSelectMethod, 
  selectedPlan, 
  isLoading,
  onUploadReceipt
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingMethodId, setPendingMethodId] = useState(null);

  // Function to open confirmation dialog
  const openConfirmationDialog = (methodId) => {
    setPendingMethodId(methodId);
    setConfirmDialogOpen(true);
  };

  // Function to close confirmation dialog
  const closeConfirmationDialog = () => {
    setConfirmDialogOpen(false);
    setPendingMethodId(null);
  };

  // Function to proceed with payment method after confirmation
  const confirmPaymentMethod = async () => {
    if (!pendingMethodId) return;
    
    const methodId = pendingMethodId;
    setSelectedMethod(methodId);
    closeConfirmationDialog();
    
    if (methodId === 'incash') {
      // For cash payments, just process normally
      onSelectMethod(methodId);
    } else if (methodId === 'online') {
      // For online payments, initiate payment first
      try {
        const paymentData = await onSelectMethod(methodId);
        if (paymentData && paymentData.paymentId) {
          setPaymentId(paymentData.paymentId);
          setPaymentInitiated(true);
          setShowUploadSection(true);
        }
      } catch (error) {
        console.error('Error initiating payment:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!receiptFile || !paymentId) return;
    
    try {
      await onUploadReceipt(paymentId, receiptFile);
      // Close modal after successful upload
      onClose();
    } catch (error) {
      console.error('Error uploading receipt:', error);
    }
  };

  if (!isOpen) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { delay: 0.1 } }
  };

  const paymentMethods = [
    {
      id: 'online',
      name: 'Pay Online ',
      description: 'Secure online payment with credit/debit card or mobile money',
      image: chapaLogo,
      imageAlt: 'Chapa Payment Gateway Logo'
    },
    {
      id: 'incash',
      name: 'Pay in Cash',
      description: 'Pay at our facility with cash',
      image: cashIcon,
      imageAlt: 'Cash Payment Icon'
    }
  ];

  // Get the name of the pending payment method for the confirmation dialog
  const getPendingMethodName = () => {
    if (!pendingMethodId) return '';
    const method = paymentMethods.find(m => m.id === pendingMethodId);
    return method ? method.name : '';
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="bg-gray-900 rounded-lg max-w-4xl w-full my-4 shadow-xl relative"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Modal Content */}
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-900 z-10 pb-2">
              <h2 className="text-2xl font-bold text-white">
                {showUploadSection ? 'Upload Payment Receipt' : 'Select Payment Method'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedPlan && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Selected Plan</h3>
                <div className="flex justify-between">
                  <span className="text-gray-300">{selectedPlan.title}</span>
                  <span className="text-white font-bold">{selectedPlan.price}</span>
                </div>
              </div>
            )}

            {!showUploadSection ? (
              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => !isLoading && openConfirmationDialog(method.id)}
                  >
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-900 rounded-lg p-2 mr-4">
                      <img 
                        src={method.image} 
                        alt={method.imageAlt} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{method.name}</h4>
                      <p className="text-gray-400 text-sm">{method.description}</p>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left side - Bank Account Information */}
                <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <BsBank className="mr-2" /> Bank Account Information
                  </h4>
                  
                  <div className="bg-gray-900 p-4 rounded-lg mb-4 max-h-[250px] overflow-y-auto">
                    {bankAccounts.map(account => (
                      <BankAccountItem 
                        key={account.id}
                        bankName={account.bankName} 
                        accountNumber={account.accountNumber} 
                        icon={account.icon} 
                      />
                    ))}
                  </div>
                  
                  <p className="text-yellow-400 text-sm">
                    <strong>Note:</strong> Please include your name and membership plan in the transfer description.
                  </p>
                </div>
                
                {/* Right side - Payment Receipt Upload */}
                <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">
                    Payment Receipt Upload
                  </h4>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    After making your payment, please upload the receipt to complete your transaction.
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5">
                          {receiptFile ? (
                            <div className="text-center">
                              <p className="text-sm text-gray-300 mb-2">
                                {receiptFile.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Click to change file
                              </p>
                            </div>
                          ) : (
                            <>
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="pt-1 text-sm text-gray-400">
                                Click to upload receipt
                              </p>
                              <p className="text-xs text-gray-500">
                                Supported formats: JPG, PNG, PDF
                              </p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <PrimaryButton
                      colorScheme="blueWhite"
                      onClick={handleUpload}
                      disabled={isLoading || !receiptFile}
                      className="w-full"
                    >
                      {isLoading ? 'Uploading...' : 'Upload Receipt'}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            )}

            {/* Fixed footer with action buttons */}
            <div className="mt-6 flex justify-end">
              <PrimaryButton
                colorScheme="blueWhite"
                onClick={onClose}
                disabled={isLoading}
                className="mr-2"
              >
                Cancel
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={closeConfirmationDialog}
        aria-labelledby="payment-confirmation-dialog-title"
        aria-describedby="payment-confirmation-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: 'black',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          },
        }}
      >
        <DialogTitle id="payment-confirmation-dialog-title" className="text-center font-bold text-white">
          {"Confirm Payment Method"}
        </DialogTitle>
        <DialogContent>
        <DialogTitle id="payment-confirmation-dialog-title" className="text-center font-bold text-white">
          {`Are you sure you want to continue with ${getPendingMethodName()} ?`}
        </DialogTitle>
        </DialogContent>
        <DialogActions className="flex justify-center pb-4 px-6 gap-4">
          <SecondaryButton onClick={closeConfirmationDialog} className="px-6">
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={confirmPaymentMethod} colorScheme="redOrange" className="px-6">
            Continue
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentMethodModal;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from '../ui/Buttons';

// Payment method images
import chapaLogo from '/home/payment/chapa.png';
import cashIcon from '/home/payment/incash.png';

const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  onSelectMethod, 
  selectedPlan, 
  isLoading 
}) => {
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
      name: 'Pay Online with Chapa',
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

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Select Payment Method</h2>
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

          <div className="space-y-4 mb-6">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                onClick={() => !isLoading && onSelectMethod(method.id)}
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

          {isLoading && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
          )}

          <div className="flex justify-end">
            <PrimaryButton
              colorScheme="blueWhite"
              onClick={onClose}
              disabled={isLoading}
              className="mr-2"
            >
              Cancel
            </PrimaryButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentMethodModal;
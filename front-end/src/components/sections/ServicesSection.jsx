import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { PrimaryButton } from '../ui/Buttons';
import { gradients } from '../../utils/themeColors';
import usePayment from '../../hooks/usePayment';
import PaymentMethodModal from '../payment/PaymentMethodModal';

const PricingCard = ({ title, price, duration, features, isPopular, gradient, onSelectPlan, genderSpecific = false }) => {
  const [selectedGender, setSelectedGender] = useState('male');
  const gradientClass = gradients[gradient] || gradients.redOrange;
  
  const handleSelectPlan = () => {
    const finalPrice = genderSpecific 
      ? (selectedGender === 'male' ? price.male : price.female) 
      : price;
    
    onSelectPlan(title, finalPrice, selectedGender);
  };
  
  return (
    <motion.div 
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-xl relative ${
        isPopular ? 'border-2 border-red-500 transform scale-105 z-10' : ''
      }`}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3 }
      }}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-red-500 text-white py-1 px-4 rounded-bl-lg font-semibold text-sm">
          Most Popular
        </div>
      )}
      
      <div className={`w-full h-2 bg-gradient-to-r ${gradientClass}`}></div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        
        {genderSpecific ? (
          <div className="mb-4">
            {/* Improved gender toggle UI */}
            <div className="flex bg-gray-900 p-1 rounded-full mb-3">
              <button
                className={`flex-1 py-1.5 px-2 rounded-full text-sm transition-colors ${
                  selectedGender === 'male' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setSelectedGender('male')}
              >
                Men: {price.male}
              </button>
              <button
                className={`flex-1 py-1.5 px-2 rounded-full text-sm transition-colors ${
                  selectedGender === 'female' 
                    ? 'bg-pink-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setSelectedGender('female')}
              >
                Women: {price.female}
              </button>
            </div>
            <div className="text-sm text-gray-400 text-center">Valid for {duration} days</div>
          </div>
        ) : (
          <div className="mb-5">
            <div className="mb-2 text-center">
              <span className="text-3xl font-bold text-white">{price}</span>
              {duration !== 1 && <span className="text-gray-400">/package</span>}
            </div>
            <div className="text-sm text-gray-400 text-center">Valid for {duration} days</div>
          </div>
        )}
        
        <ul className="mb-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <svg className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <PrimaryButton 
          colorScheme={isPopular ? "redOrange" : "blueWhite"} 
          className="w-full py-2.5 text-center text-sm font-medium"
          onClick={handleSelectPlan}
        >
          Select Plan
        </PrimaryButton>
      </div>
    </motion.div>
  );
};

const ServicesSection = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { 
    openPaymentMethodModal, 
    closePaymentModal, 
    processPayment,
    uploadPaymentReceipt, 
    showPaymentModal, 
    selectedPlan, 
    isLoading, 
    error,
    setError 
  } = usePayment();

  // Display error notification when error state changes
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        autoHideDuration: 5000
      });
      
      // Clear error after showing notification
      setError(null);
    }
  }, [error, enqueueSnackbar, setError]);
  const pricingPlans = [
    {
      title: "Daily Plan",
      price: "300 ETB",
      priceValue: 300,
      duration: 1,
      features: [
        "One-day full access",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance"
      ],
      isPopular: false,
      gradient: "blueWhite"
    },
    {
      title: "Monthly Plan",
      price: {
        male: "4,000 ETB",
        female: "3,500 ETB"
      },
      priceValue: {
        male: 4000,
        female: 3500
      },
      duration: 30,
      features: [
        "2 guest coupons (free passes for friends)",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance"
      ],
      isPopular: true,
      gradient: "redOrange",
      genderSpecific: true
    },
    {
      title: "3-Month Plan",
      price: "10,680 ETB",
      priceValue: 10680,
      duration: 90,
      features: [
        "11% discount applied",
        "5 guest coupons",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance"
      ],
      isPopular: false,
      gradient: "blueWhite"
    },
    {
      title: "6-Month Plan",
      price: "20,400 ETB",
      priceValue: 20400,
      duration: 180,
      features: [
        "15% discount applied",
        "10 guest coupons",
        "15 free pass days included",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance"
      ],
      isPopular: false,
      gradient: "blackWhite"
    },
    {
      title: "12-Month Plan",
      price: "38,880 ETB",
      priceValue: 38880,
      duration: 365,
      features: [
        "19% discount applied",
        "30 free pass days",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance"
      ],
      isPopular: false,
      gradient: "blueWhite"
    }
  ];

  // Handle plan selection
  const handleSelectPlan = (planTitle, price, gender = null) => {
    // Find the plan object
    const plan = pricingPlans.find(plan => plan.title === planTitle);
    
    if (!plan) {
      enqueueSnackbar('Selected plan not found', { variant: 'error' });
      return;
    }

    // Create a plan object with the selected details
    const selectedPlanDetails = {
      ...plan,
      selectedGender: gender,
      // If it's the monthly plan with gender-specific pricing, use the appropriate price
      price: gender ? plan.price[gender] : plan.price,
      priceValue: gender ? plan.priceValue[gender] : plan.priceValue
    };

    // Open payment method selection modal
    openPaymentMethodModal(selectedPlanDetails);
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = async (paymentMethod) => {
    try {
      const paymentData = await processPayment(paymentMethod);
      
      if (paymentMethod === 'incash') {
        enqueueSnackbar('In-cash payment request submitted successfully', { 
          variant: 'success',
          autoHideDuration: 5000
        });
      }
      
      return paymentData;
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  // Handle receipt upload
  const handleUploadReceipt = async (paymentId, receiptFile) => {
    try {
      const uploadData = await uploadPaymentReceipt(paymentId, receiptFile);
      
      enqueueSnackbar('Receipt uploaded successfully. Waiting for approval.', { 
        variant: 'success',
        autoHideDuration: 5000
      });
      
      return uploadData;
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar('Failed to upload receipt. Please try again.', { 
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="services" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">💪 Individual Packages</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan to achieve your fitness goals
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                ...fadeIn,
                visible: {
                  ...fadeIn.visible,
                  transition: { delay: 0.2 * index, duration: 0.6 }
                }
              }}
              className={isLoading ? "opacity-50 pointer-events-none" : ""}
            >
              <PricingCard 
                title={plan.title}
                price={plan.price}
                duration={plan.duration}
                features={plan.features}
                isPopular={plan.isPopular}
                gradient={plan.gradient}
                genderSpecific={plan.genderSpecific}
                onSelectPlan={handleSelectPlan}
              />
            </motion.div>
          ))}
        </div>
        
        {isLoading && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        )}
        
        {/* Payment Method Selection Modal */}
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={closePaymentModal}
          onSelectMethod={handleSelectPaymentMethod}
          onUploadReceipt={handleUploadReceipt}
          selectedPlan={selectedPlan}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default ServicesSection;

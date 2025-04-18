import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { PrimaryButton } from '../ui/Buttons';
import { gradients } from '../../utils/themeColors';
import usePayment from '../../hooks/usePayment';
import PaymentMethodModal from '../payment/PaymentMethodModal';

const PricingCard = ({ title, price, duration, features, isPopular, gradient, onSelectPlan }) => {
  const gradientClass = gradients[gradient] || gradients.redOrange;
  
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
      
      <div className="p-8">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <div className="mb-2">
          <span className="text-3xl font-bold text-white">{price}</span>
          <span className="text-gray-400">/month</span>
        </div>
        <div className="mb-6">
          <span className="text-sm text-gray-400">Valid for {duration} days</span>
        </div>
        
        <ul className="mb-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <PrimaryButton 
          colorScheme={isPopular ? "redOrange" : "blueWhite"} 
          className="w-full py-3 text-center"
          onClick={() => onSelectPlan(title, price)}
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
      title: "Fitness Basic",
      price: "1,200 ETB",
      priceValue: 1200,
      duration: 30,
      features: [
        "Full gym access",
        "Basic fitness assessment",
        "2 group classes per week",
        "Locker access"
      ],
      isPopular: false,
      gradient: "blueWhite"
    },
    {
      title: "Premium",
      price: "2,500 ETB",
      priceValue: 2500,
      duration: 30,
      features: [
        "Full gym & spa access",
        "Advanced fitness assessment",
        "Unlimited group classes",
        "3 personal training sessions/month",
        "Nutrition consultation",
        "Towel service"
      ],
      isPopular: true,
      gradient: "redOrange"
    },
    {
      title: "Spa Essentials",
      price: "1,800 ETB",
      priceValue: 1800,
      duration: 30,
      features: [
        "Full spa access",
        "2 massage treatments/month",
        "Sauna & steam room",
        "Pool access",
        "Relaxation lounges"
      ],
      isPopular: false,
      gradient: "blueWhite"
    }
  ];

  // Handle plan selection
  const handleSelectPlan = (planTitle) => {
    // Find the plan object to get the price value
    const selectedPlan = pricingPlans.find(plan => plan.title === planTitle);
    
    if (!selectedPlan) {
      enqueueSnackbar('Selected plan not found', { variant: 'error' });
      return;
    }

    // Open payment method selection modal
    openPaymentMethodModal(selectedPlan);
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = async (paymentMethod) => {
      await processPayment(paymentMethod);
      if (paymentMethod === 'incash') {
        enqueueSnackbar('In-cash payment request submitted successfully', { 
          variant: 'success',
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
          <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan to achieve your fitness goals and wellness needs
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
            >
              <PricingCard 
                title={plan.title}
                price={plan.price}
                duration={plan.duration}
                features={plan.features}
                isPopular={plan.isPopular}
                gradient={plan.gradient}
                onSelectPlan={(title) => handleSelectPlan(title)}
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
          selectedPlan={selectedPlan}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default ServicesSection;

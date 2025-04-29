"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { PrimaryButton } from "../ui/Buttons";
import { gradients } from "../../utils/themeColors";
import usePayment from "../../hooks/usePayment";
import PaymentMethodModal from "../payment/PaymentMethodModal";

const PricingCard = ({
  title,
  price,
  duration,
  features,
  isPopular,
  gradient,
  genderSpecific = false,
  onSelectPlan,
}) => {
  const [selectedGender, setSelectedGender] = useState("male");
  const gradientClass = gradients[gradient] || gradients.redOrange;

  const handleSelectPlan = () => {
    onSelectPlan(title, genderSpecific ? selectedGender : null);
  };

  return (
    <motion.div
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-xl relative ${
        isPopular ? "border-2 border-red-500 transform scale-105 z-10" : ""
      }`}
      whileHover={{
        y: -10,
        transition: { duration: 0.3 },
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
                  selectedGender === "male"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setSelectedGender("male")}
              >
                Men: {price.male}
              </button>
              <button
                className={`flex-1 py-1.5 px-2 rounded-full text-sm transition-colors ${
                  selectedGender === "female"
                    ? "bg-pink-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setSelectedGender("female")}
              >
                Women: {price.female}
              </button>
            </div>
            <div className="text-sm text-gray-400 text-center">
              Valid for {duration} days
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <div className="mb-2 text-center">
              <span className="text-3xl font-bold text-white">{price}</span>
              {duration !== 1 && (
                <span className="text-gray-400">/package</span>
              )}
            </div>
            <div className="text-sm text-gray-400 text-center">
              Valid for {duration} days
            </div>
          </div>
        )}

        <ul className="mb-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <svg
                className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
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

// Package category component
const PackageCategory = ({
  title,
  plans,
  isLoading,
  handleSelectPlan,
  fadeIn,
}) => {
  return (
    <div className="mb-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="text-center mb-10"
      >
        <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              ...fadeIn,
              visible: {
                ...fadeIn.visible,
                transition: { delay: 0.2 * index, duration: 0.6 },
              },
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
    </div>
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
    setError,
  } = usePayment();

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        autoHideDuration: 5000,
      });
      setError(null);
    }
  }, [error, enqueueSnackbar, setError]);

  // Individual Packages
  const individualPlans = [
    {
      title: "Daily",
      price: {
        male: "700 ETB",
        female: "700 ETB",
      },
      priceValue: {
        male: 700,
        female: 700,
      },
      duration: 1,
      features: [
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance",
      ],
      isPopular: true,
      gradient: "redOrange",
      genderSpecific: true,
    },
    {
      title: "1 Month",
      price: {
        male: "4,000 ETB",
        female: "3,500 ETB",
      },
      priceValue: {
        male: 4000,
        female: 3500,
      },
      duration: 30,
      features: [
        "Full gym access",
        "2 Free Guest Coupons",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance",
      ],
      isPopular: true,
      gradient: "redOrange",
      genderSpecific: true,
    },
    {
      title: "3 Month",
      price: {
        male: "10,680 ETB",
        female: "9,345 ETB",
      },
      priceValue: {
        male: 10680,
        female: 9345,
      },
      duration: 90,
      features: [
        "Full gym access",
        "5 Free Guest Coupons",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance",
      ],
      isPopular: false,
      gradient: "blueWhite",
      genderSpecific: true,
    },
    {
      title: "6 Month",
      price: {
        male: "20,400 ETB",
        female: "17,850 ETB",
      },
      priceValue: {
        male: 20400,
        female: 17850,
      },
      duration: 195,
      features: [
        "15 free pass days included",
        "10 Free Guest Coupons",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance",
      ],
      isPopular: false,
      gradient: "blackWhite",
      genderSpecific: true,
    },
    {
      title: "12 Month",
      price: {
        male: "38,880 ETB",
        female: "34,020 ETB",
      },
      priceValue: {
        male: 38880,
        female: 34020,
      },
      duration: 395,
      features: [
        "30 free pass days included",
        "10 Free Guest Coupons",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance",
      ],
      isPopular: false,
      gradient: "blueWhite",
      genderSpecific: true,
    },
  ];

  // Group Packages
  const groupPlans = [
    {
      title: "3 Month",
      price: {
        male: "12,000 ETB",
        female: "10,500 ETB",
      },
      priceValue: {
        male: 12000,
        female: 10500,
      },
      duration: 90,
      features: [
        "5 Free Guest Coupons",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Group training sessions",
        "Community events",
      ],
      isPopular: false,
      gradient: "blueWhite",
      genderSpecific: true,
    },
    {
      title: "6 Month",
      price: {
        male: "21,360 ETB",
        female: "18,690 ETB",
      },
      priceValue: {
        male: 21360,
        female: 18690,
      },
      duration: 180,
      features: [
        "10 Free Guest Coupons",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Group training sessions",
        "Community events",
        "Fitness challenges",
      ],
      isPopular: false,
      gradient: "blackWhite",
      genderSpecific: true,
    },
    {
      title: "12 Month",
      price: {
        male: "40,800 ETB",
        female: "35,700 ETB",
      },
      priceValue: {
        male: 40800,
        female: 35700,
      },
      duration: 365,
      features: [
        "20 Free Guest Coupons",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Group training sessions",
        "Community events",
        "Fitness challenges",
        "Nutrition guidance",
      ],
      isPopular: false,
      gradient: "blueWhite",
      genderSpecific: true,
    },
  ];

  // Family Packages
  const familyPlans = [
    {
      title: "3 Month",
      price: {
        male: "10,300 ETB",
        female: "9,030 ETB",
      },
      priceValue: {
        male: 10300,
        female: 9030,
      },
      duration: 90,
      features: [
        "5 Free Guest Coupons",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Basic trainer guidance",
        "Family activities",
      ],
      isPopular: false,
      gradient: "redOrange",
      genderSpecific: true,
    },
  ];

  // Personalized Packages
  const personalizedPlans = [
    {
      title: "3 Month",
      price: {
        male: "18,690 ETB",
        female: "17,355 ETB",
      },
      priceValue: {
        male: 18690,
        female: 17355,
      },
      duration: 90,
      features: [
        "Personalized training program",
        "5 Free Guest Coupons",
        "One-on-one coaching",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
        "Flexible class timing",
      ],
      isPopular: false,
      gradient: "blueWhite",
      genderSpecific: true,
    },
    {
      title: "6 Month",
      price: {
        male: "35,700 ETB",
        female: "33,150 ETB",
      },
      priceValue: {
        male: 35700,
        female: 33150,
      },
      duration: 195,
      features: [
        "15 free pass days included",
        "10 Free Guest Coupons",
        "Flexible class timing",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
      ],
      isPopular: false,
      gradient: "blackWhite",
      genderSpecific: true,
    },
    {
      title: "12 Month",
      price: {
        male: "68,040 ETB",
        female: "63,180 ETB",
      },
      priceValue: {
        male: 68040,
        female: 63180,
      },
      duration: 395,
      features: [
        "30 free pass days included",
        "20 Free Guest Coupons",
        "Flexible class timing",
        "Full gym access",
        "Clean shower & dressing room",
        "Secure parking",
      ],
      isPopular: false,
      gradient: "blueWhite",
      genderSpecific: true,
    },
  ];

  const handleSelectPlan = (planTitle, gender = null) => {
    // Find the plan across all categories
    const allPlans = [
      ...individualPlans,
      ...groupPlans,
      ...familyPlans,
      ...personalizedPlans,
    ];
    const plan = allPlans.find((p) => p.title === planTitle);

    if (!plan) {
      enqueueSnackbar("Selected plan not found", { variant: "error" });
      return;
    }

    const selectedPlanDetails = {
      ...plan,
      selectedGender: gender,
      price: gender ? plan.price[gender] : plan.price,
      priceValue: gender ? plan.priceValue[gender] : plan.priceValue,
    };

    openPaymentMethodModal(selectedPlanDetails);
  };

  const handleSelectPaymentMethod = async (paymentMethod) => {
    try {
      const paymentData = await processPayment(paymentMethod);

      if (paymentMethod === "incash") {
        enqueueSnackbar("In-cash payment request submitted successfully", {
          variant: "success",
          autoHideDuration: 5000,
        });
      }

      return paymentData;
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  // Handle receipt upload
  const handleUploadReceipt = async (paymentId, receiptFile) => {
    try {
      const uploadData = await uploadPaymentReceipt(paymentId, receiptFile);

      enqueueSnackbar("Receipt uploaded successfully. Waiting for approval.", {
        variant: "success",
        autoHideDuration: 5000,
      });

      return uploadData;
    } catch (error) {
      console.error("Upload error:", error);
      enqueueSnackbar("Failed to upload receipt. Please try again.", {
        variant: "error",
        autoHideDuration: 5000,
      });
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
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
          <h2 className="text-4xl font-bold text-white mb-4">
            💪 Membership Packages
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan to achieve your fitness goals
          </p>
        </motion.div>

        {/* Individual Packages */}
        <PackageCategory
          title="Individual Packages"
          plans={individualPlans}
          isLoading={isLoading}
          handleSelectPlan={handleSelectPlan}
          fadeIn={fadeIn}
        />

        {/* Group Packages */}
        <PackageCategory
          title="Group Package S&C Classes"
          plans={groupPlans}
          isLoading={isLoading}
          handleSelectPlan={handleSelectPlan}
          fadeIn={fadeIn}
        />

        {/* Family Packages */}
        <PackageCategory
          title="Family Packages"
          plans={familyPlans}
          isLoading={isLoading}
          handleSelectPlan={handleSelectPlan}
          fadeIn={fadeIn}
        />

        {/* Personalized Packages */}
        <PackageCategory
          title="Personalized Package"
          plans={personalizedPlans}
          isLoading={isLoading}
          handleSelectPlan={handleSelectPlan}
          fadeIn={fadeIn}
        />

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

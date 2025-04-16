import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrimaryButton, OutlineButton } from '../../components/ui/Buttons';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiTarget, FiHeart, FiHome, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import useFormValidation from '../../hooks/useFormValidation';
import { registrationSchema } from '../../schemas/authSchemas';

const RegisterPage = () => {
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Use the form validation hook with the registration schema
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  } = useFormValidation(registrationSchema, {
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    dateOfBirth: '',
    address: '',
    fitnessGoals: '',
    medicalConditions: '',
    agreeToTerms: false
  });

  // Handle form submission
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Registration data:', formData);
      
      // Reset form and show success message
      resetForm();
      setShowSuccessMessage(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error message
  const clearError = () => {
    setSubmitError(null);
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
    <div className="min-h-screen flex flex-col bg-gray-900">
      
      {/* Home Icon */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <motion.div
            className="bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome className="text-white text-xl" />
          </motion.div>
        </Link>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side - Image and Info */}
              <motion.div 
                className="relative hidden md:block"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: "url('/home/logo.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-80"></div>
                </div>
                <div className="relative h-full flex flex-col justify-center p-12 text-white z-10">
                  <h2 className="text-3xl font-bold mb-6">Join Our Fitness Community</h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-red-500 p-2 rounded-full mr-4 flex-shrink-0">
                        <FiTarget className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-1">Personalized Programs</h3>
                        <p className="text-gray-300">Tailored fitness plans designed for your specific goals and needs.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-red-500 p-2 rounded-full mr-4 flex-shrink-0">
                        <FiHeart className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-1">Expert Guidance</h3>
                        <p className="text-gray-300">Our certified trainers will support you every step of your fitness journey.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-red-500 p-2 rounded-full mr-4 flex-shrink-0">
                        <FiAlertCircle className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-1">Premium Facilities</h3>
                        <p className="text-gray-300">Access to state-of-the-art equipment and luxury amenities.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Right Side - Registration Form */}
              <motion.div 
                className="p-8 md:p-12"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Membership Registration</h2>
                  <p className="text-gray-400 mt-2">
                    Fill out the form below to join Latest Fitness
                  </p>
                </div>
                
                {/* Success Message */}
                {showSuccessMessage && (
                  <motion.div 
                    className="bg-green-500 text-white p-4 rounded-lg mb-6 flex items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <FiCheckCircle className="mr-2 text-xl" />
                    <span>Registration successful! Welcome to Latest Fitness.</span>
                  </motion.div>
                )}
                
                {/* Error Message */}
                {submitError && (
                  <motion.div 
                    className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FiAlertCircle className="mr-2 text-xl" />
                    <div>
                      <p className="font-semibold">Registration failed</p>
                      <p className="text-sm">{submitError}</p>
                    </div>
                    <button 
                      onClick={clearError} 
                      className="ml-auto text-white hover:text-gray-200"
                      aria-label="Dismiss error"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                  
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-gray-300 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={values.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-700 border ${
                          errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    {errors.fullName && touched.fullName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-500" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-700 border ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-gray-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-700 border ${
                          errors.phone && touched.phone ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        placeholder="+251 911 123 456"
                        required
                      />
                    </div>
                    {errors.phone && touched.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  
                  {/* Emergency Contact */}
                  <div>
                    <label htmlFor="emergencyContact" className="block text-gray-300 mb-2">Emergency Contact</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        id="emergencyContact"
                        name="emergencyContact"
                        value={values.emergencyContact}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-700 border ${
                          errors.emergencyContact && touched.emergencyContact ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        placeholder="+251 911 123 456"
                        required
                      />
                    </div>
                    {errors.emergencyContact && touched.emergencyContact && (
                      <p className="mt-1 text-sm text-red-500">{errors.emergencyContact}</p>
                    )}
                  </div>
                  
                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-gray-300 mb-2">Date of Birth</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-500" />
                      </div>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={values.dateOfBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-700 border ${
                          errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        required
                      />
                    </div>
                    {errors.dateOfBirth && touched.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
                    )}
                  </div>
                  
                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-gray-300 mb-2">Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-700 border ${
                          errors.address && touched.address ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        placeholder="Hawassa, Ethiopia"
                        required
                      />
                    </div>
                    {errors.address && touched.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                  
                  {/* Fitness Goals (Optional) */}
                  <div>
                    <label htmlFor="fitnessGoals" className="block text-gray-300 mb-2">
                      Fitness Goals (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiTarget className="text-gray-500" />
                      </div>
                      <textarea
                        id="fitnessGoals"
                        name="fitnessGoals"
                        value={values.fitnessGoals}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows="3"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="What are your fitness goals?"
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Medical Conditions (Optional) */}
                  <div>
                    <label htmlFor="medicalConditions" className="block text-gray-300 mb-2">
                      Medical Conditions (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiHeart className="text-gray-500" />
                      </div>
                      <textarea
                        id="medicalConditions"
                        name="medicalConditions"
                        value={values.medicalConditions}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows="3"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Any medical conditions we should be aware of?"
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Terms and Conditions */}
                  <div className="mt-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={values.agreeToTerms}
                          onChange={handleChange}
                          className="h-4 w-4 bg-gray-700 border-gray-600 rounded focus:ring-red-500 text-red-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreeToTerms" className="text-gray-300">
                          I accept the <a href="/terms" className="text-red-500 hover:text-red-400">terms and conditions</a> and <a href="/privacy" className="text-red-500 hover:text-red-400">privacy policy</a>
                        </label>
                      </div>
                    </div>
                    {errors.agreeToTerms && touched.agreeToTerms && (
                      <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
                    )}
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link to="/login">
                      <OutlineButton colorScheme="light" className="w-full sm:w-auto py-3">
                        Back
                      </OutlineButton>
                    </Link>
                    
                    <PrimaryButton 
                      type="submit"
                      colorScheme="redOrange" 
                      className="w-full sm:w-auto py-3 flex-grow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Complete Registration'}
                    </PrimaryButton>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
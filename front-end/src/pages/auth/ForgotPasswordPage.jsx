import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { PrimaryButton } from '../../components/ui/Buttons';
import { FiMail, FiHome, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import useForgotPassword from '../../hooks/useForgotPassword';
const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState('');
  const { requestPasswordReset, isLoading, isSuccess, error, reset } = useForgotPassword();

  // Validation schema using Zod
  const validationSchema = z.object({
    email: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const success = await requestPasswordReset(values.email);
    if (success) {
      setEmailSent(values.email);
    }
    setSubmitting(false);
  };

  const handleTryDifferentEmail = () => {
    setEmailSent('');
    reset();
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
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side - Image and Quote */}
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
                  <h2 className="text-3xl font-bold mb-6">Password Recovery</h2>
                  <blockquote className="text-xl italic mb-8">
                    "Don't worry, it happens to the best of us. We'll help you get back to your fitness journey in no time."
                  </blockquote>
                  <p className="text-sm text-gray-300">
                    Latest Fitness - Hawassa's Premier Fitness & Wellness Destination
                  </p>
                </div>
              </motion.div>
              
              {/* Right Side - Forgot Password Form */}
              <motion.div 
                className="p-8 md:p-12"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Forgot Your Password?</h2>
                  <p className="text-gray-400 mt-2">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>
                
                {emailSent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-6">
                      <div className="bg-green-500 rounded-full p-4 inline-flex">
                        <FiCheckCircle className="text-white text-4xl" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Check Your Email</h3>
                    <p className="text-gray-300 mb-6">
                      We've sent a password reset link to:
                    </p>
                    <p className="text-white font-medium mb-8 text-lg">
                      {emailSent}
                    </p>
                    <p className="text-gray-400 mb-8">
                      Please check your inbox and follow the instructions to reset your password. 
                      If you don't see the email, check your spam folder.
                    </p>
                    <div className="flex flex-col space-y-4">
                      <PrimaryButton 
                        onClick={handleTryDifferentEmail}
                        colorScheme="redOrange" 
                        className="w-full py-3"
                      >
                        Try a different email
                      </PrimaryButton>
                      <Link to="/login" className="text-red-500 hover:text-red-400">
                        Return to login
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <Formik
                    initialValues={{ email: '' }}
                    validationSchema={toFormikValidationSchema(validationSchema)}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form>
                        <div className="mb-6">
                          <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiMail className="text-gray-500" />
                            </div>
                            <Field
                              type="email"
                              id="email"
                              name="email"
                              className={`w-full bg-gray-700 border ${
                                errors.email && touched.email ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="your@email.com"
                            />
                          </div>
                          <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-500" />
                          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        </div>
                        
                        <PrimaryButton 
                          type="submit"
                          colorScheme="redOrange" 
                          className="w-full py-3 mb-6"
                          disabled={isSubmitting || isLoading}
                        >
                          {isSubmitting || isLoading ? 'Sending...' : 'Send Reset Link'}
                        </PrimaryButton>
                        
                        <div className="text-center">
                          <Link to="/login" className="flex items-center justify-center text-red-500 hover:text-red-400">
                            <FiArrowLeft className="mr-2" />
                            Back to login
                          </Link>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default ForgotPasswordPage;

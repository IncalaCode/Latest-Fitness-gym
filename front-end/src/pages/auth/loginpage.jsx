import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { PrimaryButton } from '../../components/ui/Buttons';
import { FiUser, FiLock, FiEye, FiEyeOff, FiHome, FiAlertCircle } from 'react-icons/fi';
import useLogin from '../../hooks/useLogin';
import { toFormikValidationSchema } from '../../utils/zod-formik-adapter';


const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { 
    initialValues, 
    validationSchema, 
    handleSubmit, 
    isLoading, 
    error, 
    clearError 
  } = useLogin();
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                  <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
                  <blockquote className="text-xl italic mb-8">
                    "The only bad workout is the one that didn't happen. Login to continue your fitness journey with us."
                  </blockquote>
                  <p className="text-sm text-gray-300">
                    Latest Fitness - Hawassa's Premier Fitness & Wellness Destination
                  </p>
                </div>
              </motion.div>
              
              {/* Right Side - Login Form */}
              <motion.div 
                className="p-8 md:p-12"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Login to Your Account</h2>
                  <p className="text-gray-400 mt-2">
                    Access your membership, classes, and more
                  </p>
                </div>
                
                {error && (
                  <motion.div 
                    className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FiAlertCircle className="mr-2 text-xl" />
                    <div>
                      <p className="font-semibold">Login failed</p>
                      <p className="text-sm">{error}</p>
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
                
                <Formik
                  initialValues={initialValues}
                  validationSchema={toFormikValidationSchema(validationSchema)}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-500" />
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
                      </div>
                  
                      <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="text-gray-500" />
                          </div>
                          <Field
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            className={`w-full bg-gray-700 border ${
                              errors.password && touched.password ? 'border-red-500' : 'border-gray-600'
                            } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <FiEyeOff className="text-gray-500 hover:text-gray-300" />
                            ) : (
                              <FiEye className="text-gray-500 hover:text-gray-300" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-500" />
                      </div>
                  
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <Field
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            className="h-4 w-4 bg-gray-700 border-gray-600 rounded focus:ring-red-500 text-red-500"
                          />
                          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                            Remember me
                          </label>
                        </div>
                        <Link to="/forgot-password" className="text-sm text-red-500 hover:text-red-400">
                          Forgot password?
                        </Link>
                      </div>
                  
                      <PrimaryButton 
                        type="submit"
                        colorScheme="redOrange" 
                        className="w-full py-3 mb-6"
                        disabled={isLoading || isSubmitting}
                      >
                        {isLoading ? 'Logging in...' : 'Login'}
                      </PrimaryButton>
                      
                      <div className="text-center">
                        <p className="text-gray-400">
                          Don't have an account?{' '}
                          <Link to="/register" className="text-red-500 hover:text-red-400">
                            Sign up
                          </Link>
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default LoginPage;

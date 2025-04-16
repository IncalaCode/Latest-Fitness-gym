import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrimaryButton } from '../../components/ui/Buttons';
import { FiUser, FiLock, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import useFormValidation from '../../hooks/useFormValidation';
import { loginSchema } from '../../schemas/authSchemas';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Use the form validation hook with the login schema
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  } = useFormValidation(loginSchema, {
    email: '',
    password: '',
    rememberMe: false
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (formData) => {
    console.log('Login submitted:', formData);
    // Here you would typically handle authentication
    // For example: await authService.login(formData.email, formData.password, formData.rememberMe);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        // On success, you might redirect:
        // navigate('/dashboard');
      }, 1000);
    });
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
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-500" />
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
                  
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-500" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-700 border ${
                          errors.password && touched.password ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        placeholder="••••••••"
                        required
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
                    {errors.password && touched.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={values.rememberMe}
                        onChange={handleChange}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </PrimaryButton>
                  
                  <div className="text-center">
                    <p className="text-gray-400">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-red-500 hover:text-red-400">
                        Sign up
                      </Link>
                    </p>
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

export default LoginPage;
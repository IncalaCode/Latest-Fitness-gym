import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { SnackbarProvider } from 'notistack';
import { PrimaryButton, OutlineButton } from '../../components/ui/Buttons';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiTarget, FiHeart, FiHome, FiAlertCircle } from 'react-icons/fi';
import useRegistration from '../../hooks/useRegistration';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const RegisterPage = () => {
  const { 
    initialValues, 
    validationSchema, 
    handleSubmit, 
    isLoading, 
    error, 
    clearError 
  } = useRegistration();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <SnackbarProvider maxSnack={3}>
      <div className="min-h-screen flex flex-col bg-gray-900">
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
        
        <main className="flex-grow flex items-center justify-center py-12 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
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
                  
                  {error && (
                    <motion.div 
                      className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <FiAlertCircle className="mr-2 text-xl" />
                      <div>
                        <p className="font-semibold">Registration failed</p>
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
                    {({ errors, touched, values, handleChange, handleBlur }) => (
                      <Form className="space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                        
                        <div>
                          <label htmlFor="fullName" className="block text-gray-300 mb-2">Full Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="text-gray-500" />
                            </div>
                            <Field
                              type="text"
                              id="fullName"
                              name="fullName"
                              className={`w-full bg-gray-700 border ${
                                errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="John Doe"
                            />
                          </div>
                          <ErrorMessage name="fullName" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
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
                        </div>
                        
                        <div>
                          <label htmlFor="password" className="block text-gray-300 mb-2">
                            Password (Optional - Default: 123456)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="text-gray-500" />
                            </div>
                            <Field
                              type="password"
                              id="password"
                              name="password"
                              className={`w-full bg-gray-700 border ${
                                errors.password && touched.password ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="Leave empty for default password"
                            />
                          </div>
                          <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">
                            Confirm Password (Optional)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="text-gray-500" />
                            </div>
                            <Field
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              className={`w-full bg-gray-700 border ${
                                errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="Leave empty for default password"
                            />
                          </div>
                          <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-gray-300 mb-2">Phone Number</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiPhone className="text-gray-500" />
                            </div>
                            <Field
                              type="tel"
                              id="phone"
                              name="phone"
                              className={`w-full bg-gray-700 border ${
                                errors.phone && touched.phone ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="+251911123456"
                            />
                          </div>
                          <ErrorMessage name="phone" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <h3 className="text-xl font-semibold text-white mb-4 mt-6">Emergency Contact Information</h3>
                        
                        <div>
                          <label htmlFor="emergencyContactName" className="block text-gray-300 mb-2">Emergency Contact Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="text-gray-500" />
                            </div>
                            <Field
                              type="text"
                              id="emergencyContactName"
                              name="emergencyContactName"
                              className={`w-full bg-gray-700 border ${
                                errors.emergencyContactName && touched.emergencyContactName ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="John Doe"
                            />
                          </div>
                          <ErrorMessage name="emergencyContactName" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="emergencyContactPhone" className="block text-gray-300 mb-2">Emergency Contact Phone</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiPhone className="text-gray-500" />
                            </div>
                            <Field
                              type="tel"
                              id="emergencyContactPhone"
                              name="emergencyContactPhone"
                              className={`w-full bg-gray-700 border ${
                                errors.emergencyContactPhone && touched.emergencyContactPhone ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="+251911123456"
                            />
                          </div>
                          <ErrorMessage name="emergencyContactPhone" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="emergencyContactRelationship" className="block text-gray-300 mb-2">Relationship to Emergency Contact</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="text-gray-500" />
                            </div>
                            <Field
                              type="text"
                              id="emergencyContactRelationship"
                              name="emergencyContactRelationship"
                              className={`w-full bg-gray-700 border ${
                                errors.emergencyContactRelationship && touched.emergencyContactRelationship ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="Spouse, Parent, Sibling, etc."
                            />
                          </div>
                          <ErrorMessage name="emergencyContactRelationship" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="dateOfBirth" className="block text-gray-300 mb-2">Date of Birth</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiCalendar className="text-gray-500" />
                            </div>
                            <Field
                              type="date"
                              id="dateOfBirth"
                              name="dateOfBirth"
                              className={`w-full bg-gray-700 border ${
                                errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                            />
                          </div>
                          <ErrorMessage name="dateOfBirth" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="address" className="block text-gray-300 mb-2">Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiMapPin className="text-gray-500" />
                            </div>
                            <Field
                              type="text"
                              id="address"
                              name="address"
                              className={`w-full bg-gray-700 border ${
                                errors.address && touched.address ? 'border-red-500' : 'border-gray-600'
                              } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                              placeholder="Hawassa, Ethiopia"
                            />
                          </div>
                          <ErrorMessage name="address" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
                        <div>
                          <label htmlFor="fitnessGoals" className="block text-gray-300 mb-2">
                            Fitness Goals (Optional)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiTarget className="text-gray-500" />
                            </div>
                            <Field
                              as="textarea"
                              id="fitnessGoals"
                              name="fitnessGoals"
                              rows="3"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="What are your fitness goals?"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="medicalConditions" className="block text-gray-300 mb-2">
                            Medical Conditions (Optional)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiHeart className="text-gray-500" />
                            </div>
                            <Field
                              as="textarea"
                              id="medicalConditions"
                              name="medicalConditions"
                              rows="3"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="Any medical conditions we should be aware of?"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <Field
                                id="agreeToTerms"
                                name="agreeToTerms"
                                type="checkbox"
                                className="h-4 w-4 bg-gray-700 border-gray-600 rounded focus:ring-red-500 text-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="agreeToTerms" className="text-gray-300">
                                I accept the <a href="/terms" className="text-red-500 hover:text-red-400">terms and conditions</a> and <a href="/privacy" className="text-red-500 hover:text-red-400">privacy policy</a>
                              </label>
                            </div>
                          </div>
                          <ErrorMessage name="agreeToTerms" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                        
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
                            disabled={isLoading}
                          >
                            {isLoading ? 'Processing...' : 'Complete Registration'}
                          </PrimaryButton>
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
    </SnackbarProvider>
  );
};

export default RegisterPage;
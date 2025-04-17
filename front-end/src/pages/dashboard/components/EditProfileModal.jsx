import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiTarget, FiHeart } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { PrimaryButton } from '../../../components/ui/Buttons';

const EditProfileModal = ({ isOpen, onClose, userData, onSubmit, isLoading }) => {
  if (!isOpen) return null;

  const initialValues = {
    fullName: userData?.fullName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    emergencyContact: userData?.emergencyContact || '',
    address: userData?.address || '',
    fitnessGoals: userData?.fitnessGoals || '',
    medicalConditions: userData?.medicalConditions || '',
    photoUrl: userData?.photoUrl || ''
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <Formik
              initialValues={initialValues}
              onSubmit={onSubmit}
            >
              {({ isSubmitting, values }) => (
                <Form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
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
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <ErrorMessage name="fullName" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    {/* Email */}
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
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="your@email.com"
                          disabled
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                    </div>

                    {/* Phone */}
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
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="+251 911 123 456"
                        />
                      </div>
                      <ErrorMessage name="phone" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label htmlFor="emergencyContact" className="block text-gray-300 mb-2">Emergency Contact</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-500" />
                        </div>
                        <Field
                          type="tel"
                          id="emergencyContact"
                          name="emergencyContact"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="+251 911 123 456"
                        />
                      </div>
                      <ErrorMessage name="emergencyContact" component="p" className="mt-1 text-sm text-red-500" />
                    </div>
                  </div>

                  {/* Address */}
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
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Hawassa, Ethiopia"
                      />
                    </div>
                    <ErrorMessage name="address" component="p" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Profile Photo URL */}
                  <div>
                    <label htmlFor="photoUrl" className="block text-gray-300 mb-2">Profile Photo URL (Optional)</label>
                    <Field
                      type="text"
                      id="photoUrl"
                      name="photoUrl"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://example.com/your-photo.jpg"
                    />
                    <ErrorMessage name="photoUrl" component="p" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Fitness Goals */}
                  <div>
                    <label htmlFor="fitnessGoals" className="block text-gray-300 mb-2">
                      Fitness Goals (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
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

                  {/* Medical Conditions */}
                  <div>
                    <label htmlFor="medicalConditions" className="block text-gray-300 mb-2">
                      Medical Conditions (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
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

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <PrimaryButton
                      type="submit"
                      colorScheme="redOrange"
                      disabled={isLoading || isSubmitting}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </PrimaryButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
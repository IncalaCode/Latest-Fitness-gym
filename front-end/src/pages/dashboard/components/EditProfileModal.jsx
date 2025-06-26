import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiTarget, FiHeart, FiUpload, FiImage, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { PrimaryButton } from '../../../components/ui/Buttons';
import { IMAGE_URL } from '../../../config/config';

const EditProfileModal = ({isOpen, onClose, userData, onSubmit, isLoading }) => {
  const [previewImage, setPreviewImage] = useState(IMAGE_URL + userData?.photoUrl || null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const initialValues = {
    fullName: userData?.fullName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    emergencyContact: userData?.emergencyContact || '',
    address: userData?.address || '',
    fitnessGoals: userData?.fitnessGoals || '',
    medicalConditions: userData?.medicalConditions || '',
    photoUrl: userData?.photoUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Create a Zod schema for validation
  const validationSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    emergencyContact: z.string().optional(),
    address: z.string().optional(),
    fitnessGoals: z.string().optional(),
    medicalConditions: z.string().optional(),
    photoUrl: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .optional(),
    confirmPassword: z.string().optional()
  })
  // Add conditional validation
  .refine(data => {
    if (data.newPassword && data.newPassword.length > 0) {
      return data.currentPassword && data.currentPassword.length > 0;
    }
    return true;
  }, {
    message: "Current password is required to set a new password",
    path: ["currentPassword"]
  })
  .refine(data => {
    if (data.newPassword && data.newPassword.length > 0) {
      return data.newPassword === data.confirmPassword;
    }
    return true;
  }, {
    message: "Passwords must match",
    path: ["confirmPassword"]
  })
  .refine(data => {
    if (data.confirmPassword && data.confirmPassword.length > 0) {
      return data.newPassword && data.newPassword.length > 0;
    }
    return true;
  }, {
    message: "New password is required",
    path: ["newPassword"]
  });

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFieldValue('photoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (values, { setSubmitting }) => {
    // Extract password data if password fields are filled
    const passwordData = showPasswordFields && values.newPassword 
      ? {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        }
      : null;
    
    // Extract profile data
    const profileData = {
      fullName: values.fullName,
      phone: values.phone,
      emergencyContact: values.emergencyContact,
      address: values.address,
      fitnessGoals: values.fitnessGoals,
      medicalConditions: values.medicalConditions,
      photoUrl: values.photoUrl
    };
    
    // Call the onSubmit function with both profile and password data
    onSubmit(profileData, passwordData);
    setSubmitting(false);
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
              validationSchema={toFormikValidationSchema(validationSchema)}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                <Form className="space-y-5">
                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-700 mb-4 relative group">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt={values.fullName || 'Profile'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-3xl font-bold">
                            {values.fullName ? values.fullName.split(' ').map(name => name[0]).join('') : '?'}
                          </span>
                        </div>
                      )}
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={triggerFileInput}
                      >
                        <FiUpload className="text-white text-2xl" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                    />
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      <FiImage className="mr-1" /> Change Profile Picture
                    </button>
                    <p className="text-xs text-gray-400 mt-1">
                      Click on the image to upload a new profile picture
                    </p>
                  </div>

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

                  {/* Hidden field for photoUrl */}
                  <Field type="hidden" name="photoUrl" />

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

                  {/* Password Change Toggle */}
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="flex items-center text-blue-400 hover:text-blue-300"
                    >
                      <FiLock className="mr-2" />
                      {showPasswordFields ? 'Hide Password Fields' : 'Change Password'}
                    </button>
                  </div>

                  {/* Password Fields */}
                  {showPasswordFields && (
                    <div className="space-y-4 pt-2 pb-2 px-4 bg-gray-750 rounded-lg">
                      {/* Current Password */}
                      <div>
                        <label htmlFor="currentPassword" className="block text-gray-300 mb-2">Current Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="text-gray-500" />
                          </div>
                          <Field
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter your current password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <FiEyeOff className="text-gray-500 hover:text-gray-400" />
                            ) : (
                              <FiEye className="text-gray-500 hover:text-gray-400" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage name="currentPassword" component="p" className="mt-1 text-sm text-red-500" />
                      </div>

                      {/* New Password */}
                      <div>
                        <label htmlFor="newPassword" className="block text-gray-300 mb-2">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="text-gray-500" />
                          </div>
                          <Field
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter your new password"
                          />
                          <button
                          type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <FiEyeOff className="text-gray-500 hover:text-gray-400" />
                            ) : (
                              <FiEye className="text-gray-500 hover:text-gray-400" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage name="newPassword" component="p" className="mt-1 text-sm text-red-500" />
                        <p className="mt-1 text-xs text-gray-400">
                          Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="text-gray-500" />
                          </div>
                          <Field
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Confirm your new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <FiEyeOff className="text-gray-500 hover:text-gray-400" />
                            ) : (
                              <FiEye className="text-gray-500 hover:text-gray-400" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-sm text-red-500" />
                      </div>
                    </div>
                  )}

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

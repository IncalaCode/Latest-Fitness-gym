import React, { useState } from 'react';
import PackageModal from '../tabs/member modals/PackageModal';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { useSnackbar } from 'notistack';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { API_URL } from '../../../config/config';
import { GET_HEADER } from '../../../config/config';

const useAddMember = () => {
  const [loading, setLoading] = useState(false);

  const addMember = async (userData) => {
    try {
      setLoading(true);
      
      // Log the data being sent
      console.log("Sending user data:", userData);
      
      const options = await GET_HEADER();
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          ...options.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error adding member:', err);
      return { 
        success: false, 
        error: err.message || 'An error occurred while adding the member' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    addMember,
    loading
  };
};

const AddMemberForm = () => {
  const navigate = useNavigate();
  const { addMember, loading } = useAddMember();
  const { enqueueSnackbar } = useSnackbar();
  const validationSchema = z.object({
    fullName: z.string()
      .min(1, 'Full name is required')
      .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
    email: z.string().email('Invalid email address'),
    phone: z.string()
      .min(1, 'Phone number is required')
      .regex(/^(\+2519|09|07)\d{8}$/, 'Phone must start with +2519, 09 or 07 followed by 8 digits'),
    emergencyContactName: z.string()
      .min(1, 'Emergency contact name is required')
      .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
    emergencyContactPhone: z.string()
      .min(1, 'Emergency contact phone is required')
      .regex(/^(\+2519|09|07)\d{8}$/, 'Phone must start with +2519, 09 or 07 followed by 8 digits'),
    emergencyContactRelationship: z.string()
      .min(1, 'Emergency contact relationship is required')
      .regex(/^[A-Za-z\s]+$/, 'Relationship can only contain letters and spaces'),
    fitnessGoals: z.array(z.string()).optional(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    address: z.string().min(1, 'Address is required')
  });

  const initialValues = {
    fullName: '',
    email: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    fitnessGoals: [],
    dateOfBirth: '',
    address: ''
  };

  // eslint-disable-next-line
  const [_showPackageModal, setShowPackageModal] = useState(false);
  // eslint-disable-next-line
  const [_newMemberId, setNewMemberId] = useState(null);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Create user data object with all required fields
      const userData = {
        ...values,
        agreeToTerms: true,
        role: 'member' // Set default role if needed
      };
      
      console.log("Submitting form with values:", userData);
      
      const result = await addMember(userData);
      
      if (result.success) {
        console.log('Registration successful, user ID:', result.data.user.id);
        enqueueSnackbar('Member added successfully!', {
          variant: 'success',
          autoHideDuration: 3000
        });
        resetForm();
        setNewMemberId(result.data.user.id);
        setShowPackageModal(true);
        console.log('PackageModal should be visible now');
      } else {
        enqueueSnackbar(result.error || 'Failed to add member. Please try again.', { 
          variant: 'error',
          autoHideDuration: 5000
        });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      enqueueSnackbar(`Error: ${err.message || 'Something went wrong'}`, { 
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Add New Member</h2>
        <p className="text-gray-400 mt-2">
          Fill out the form below to add a new member
        </p>
      </div>
      
      <Formik
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(validationSchema)}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
            
            <div>
              <label htmlFor="fullName" className="block text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-500" />
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
                  <Mail className="text-gray-500" />
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
              <label htmlFor="phone" className="block text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="text-gray-500" />
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
            
            <h3 className="text-xl font-semibold text-white mb-4">Emergency Contact</h3>
            
            <div>
              <label htmlFor="emergencyContactName" className="block text-gray-300 mb-2">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-500" />
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
              <label htmlFor="emergencyContactPhone" className="block text-gray-300 mb-2">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="text-gray-500" />
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
              <label htmlFor="emergencyContactRelationship" className="block text-gray-300 mb-2">Relationship</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-500" />
                </div>
                <Field
                  type="text"
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  className={`w-full bg-gray-700 border ${
                    errors.emergencyContactRelationship && touched.emergencyContactRelationship ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Father/Mother/Spouse"
                />
              </div>
              <ErrorMessage name="emergencyContactRelationship" component="p" className="mt-1 text-sm text-red-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">Fitness Goals</h3>
            <div className="space-y-2">
              <label className="block text-gray-300 mb-2">Select fitness goals (multiple)</label>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <Field
                    type="checkbox"
                    name="fitnessGoals"
                    value="Weight Loss"
                    className="form-checkbox h-5 w-5 text-red-500 rounded"
                  />
                  <span className="ml-2 text-gray-300">Weight Loss</span>
                </label>
                <label className="inline-flex items-center">
                  <Field
                    type="checkbox"
                    name="fitnessGoals"
                    value="Muscle Gain"
                    className="form-checkbox h-5 w-5 text-red-500 rounded"
                  />
                  <span className="ml-2 text-gray-300">Muscle Gain</span>
                </label>
                <label className="inline-flex items-center">
                  <Field
                    type="checkbox"
                    name="fitnessGoals"
                    value="Cardio"
                    className="form-checkbox h-5 w-5 text-red-500 rounded"
                  />
                  <span className="ml-2 text-gray-300">Cardio</span>
                </label>
                <label className="inline-flex items-center">
                  <Field
                    type="checkbox"
                    name="fitnessGoals"
                    value="Flexibility"
                    className="form-checkbox h-5 w-5 text-red-500 rounded"
                  />
                  <span className="ml-2 text-gray-300">Flexibility</span>
                </label>
                <label className="inline-flex items-center">
                  <Field
                    type="checkbox"
                    name="fitnessGoals"
                    value="Strength"
                    className="form-checkbox h-5 w-5 text-red-500 rounded"
                  />
                  <span className="ml-2 text-gray-300">Strength</span>
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-gray-300 mb-2">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="text-gray-500" />
                </div>
                <Field
                  type="text"
                  id="address"
                  name="address"
                  className={`w-full bg-gray-700 border ${
                    errors.address && touched.address ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="123 Main St, Addis Ababa"
                />
              </div>
              <ErrorMessage name="address" component="p" className="mt-1 text-sm text-red-500" />
            </div>
            
            <div>
              <label htmlFor="dateOfBirth" className="block text-gray-300 mb-2">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="text-gray-500" />
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
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/admin/members')}
                className="w-full sm:w-auto py-3 px-6 bg-transparent border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto py-3 px-6 flex-grow bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Add Member'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
      </div>

      {_showPackageModal && _newMemberId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
          <PackageModal
            isOpen={_showPackageModal}
            onClose={() => {
              setShowPackageModal(false);
              navigate('/admin/members');
            }}
            member={{
              id: _newMemberId,
              name: initialValues.fullName || 'New Member'
            }}
          />
        </div>
      )}
    </>
  );
};

export default AddMemberForm;

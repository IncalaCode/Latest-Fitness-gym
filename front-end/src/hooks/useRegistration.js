import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { z } from 'zod';
import { AUTH_ENDPOINTS, GET_HEADER } from '../config/config';

// Define the validation schema using Zod
const registrationSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  emergencyContact: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid emergency contact number'),
  dateOfBirth: z.string().refine(date => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16; // Minimum age requirement
  }, { message: 'You must be at least 16 years old to register' }),
  address: z.string().min(5, 'Please enter a valid address'),
  fitnessGoals: z.string().optional(),
  medicalConditions: z.string().optional(),
  photoUrl: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const useRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Initial form values
  const initialValues = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    emergencyContact: '',
    dateOfBirth: '',
    address: '',
    fitnessGoals: '',
    medicalConditions: '',
    photoUrl: '',
    agreeToTerms: false
  };

  const clearError = () => setError(null);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      registrationSchema.parse(values);
      const { confirmPassword, ...registrationData } = values;
      
      const options = await GET_HEADER({ isJson: true });
      
      // Make the API call to register endpoint
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: options.headers,
        body: JSON.stringify(registrationData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // If successful, store the token in localStorage
      if (data.token) {
        localStorage.setItem('auth', JSON.stringify({
          token: data.token,
          user: data.user
        }));
      }
      
      enqueueSnackbar('Registration successful! Welcome to Latest Fitness.', { 
        variant: 'success',
        autoHideDuration: 5000
      });
      
      resetForm();
      navigate('/login');
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        setError(errorMessages.join(', '));
        enqueueSnackbar('Please check the form for errors', { 
          variant: 'error',
          autoHideDuration: 5000
        });
      } else {
        // Handle API or other errors
        setError(error.message || 'Registration failed. Please try again.');
        enqueueSnackbar('Registration failed. Please try again.', { 
          variant: 'error',
          autoHideDuration: 5000
        });
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return {
    initialValues,
    validationSchema: registrationSchema,
    handleSubmit,
    isLoading,
    error,
    clearError
  };
};

export default useRegistration;

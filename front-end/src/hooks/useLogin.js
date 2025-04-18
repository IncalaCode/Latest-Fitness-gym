import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { z } from 'zod';
import { AUTH_ENDPOINTS, GET_HEADER } from '../config/config';

// Define the validation schema using Zod
const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Initial form values
  const initialValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  const clearError = () => setError(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setError(null);
    
    try {

      loginSchema.parse(values);
      const options = await GET_HEADER({ isJson: true });
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: options.headers,
        body: JSON.stringify({
          identifier: values.email,
          password: values.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        const authData = {
          token: data.token,
          user: data.user,
          rememberMe: values.rememberMe
        };
        
        localStorage.setItem('auth', JSON.stringify(authData));
        
        enqueueSnackbar('Login successful! Welcome back.', { 
          variant: 'success',
          autoHideDuration: 3000
        });
        
        // Redirect to dashboard or home page
        navigate( authData.user.role == "member" ? '/user-dashboard' : '/admin-dashboard');
      } else {
        throw new Error('Authentication token not received');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        setError(errorMessages.join(', '));
        enqueueSnackbar('Please check your login details', { 
          variant: 'error',
          autoHideDuration: 5000
        });
      } else {
        // Handle API or other errors
        setError(error.message || 'Login failed. Please try again.');
        enqueueSnackbar(error.message || 'Login failed. Please try again.', { 
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
    validationSchema: loginSchema,
    handleSubmit,
    isLoading,
    error,
    clearError
  };
};

export default useLogin;
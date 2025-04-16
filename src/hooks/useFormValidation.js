import { useState, useEffect } from 'react';

const useFormValidation = (schema, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateForm = async () => {
      try {
        // Parse values with Zod schema
        await schema.parseAsync(values);
        
        // Clear errors for valid fields
        const newErrors = { ...errors };
        Object.keys(touched).forEach(key => {
          if (touched[key] && newErrors[key]) {
            delete newErrors[key];
          }
        });
        
        setErrors(newErrors);
        setIsValid(Object.keys(newErrors).length === 0);
      } catch (error) {
        if (error.errors) {
          const zodErrors = {};
          error.errors.forEach(err => {
            const path = err.path.join('.');
            if (touched[path]) {
              zodErrors[path] = err.message;
            }
          });
          setErrors(zodErrors);
          setIsValid(false);
        }
      }
    };

    validateForm();
  }, [values, touched]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };

  // Handle blur event to mark field as touched
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Validate all fields and return result
  const validateAll = async () => {
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    try {
      await schema.parseAsync(values);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error.errors) {
        const zodErrors = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          zodErrors[path] = err.message;
        });
        setErrors(zodErrors);
        setIsValid(false);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (onSubmit, e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const isValidForm = await validateAll();
    
    if (isValidForm) {
      await onSubmit(values);
    }
    
    setIsSubmitting(false);
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
};

export default useFormValidation;
import { z } from 'zod';

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  rememberMe: z.boolean().optional()
});

// Registration form schema
export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: 'Full name is required' })
    .min(5, { message: 'Name must be at least 5 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  phone: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^\+?[0-9\s-()]+$/, { message: 'Invalid phone number format' }),
  emergencyContact: z
    .string()
    .min(1, { message: 'Emergency contact is required' })
    .regex(/^\+?[0-9\s-()]+$/, { message: 'Invalid phone number format' }),
  dateOfBirth: z
    .string()
    .min(1, { message: 'Date of birth is required' }),
  address: z
    .string()
    .min(1, { message: 'Address is required' }),
  fitnessGoals: z
    .string()
    .optional(),
  medicalConditions: z
    .string()
    .optional(),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' }),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, { message: 'You must agree to the terms and conditions' })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Password reset schema (for future use)
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' })
});

// New password schema (for future use)
export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

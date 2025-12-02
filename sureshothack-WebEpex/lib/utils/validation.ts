import { CreateUserInput, LoginInput } from '@/lib/types/user';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Minimum 6 characters
  return password.length >= 6;
};

export const validateSignupInput = (input: CreateUserInput): { valid: boolean; error?: string } => {
  if (!input.email || !input.fullName || !input.password) {
    return { valid: false, error: 'All fields are required' };
  }

  if (!validateEmail(input.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (input.fullName.trim().length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters' };
  }

  if (!validatePassword(input.password)) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  return { valid: true };
};

export const validateLoginInput = (input: LoginInput): { valid: boolean; error?: string } => {
  if (!input.email || !input.password) {
    return { valid: false, error: 'Email and password are required' };
  }

  if (!validateEmail(input.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};


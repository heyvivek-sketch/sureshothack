/**
 * Secure storage utilities for authentication tokens
 * 
 * Note: localStorage is vulnerable to XSS attacks.
 * For production, consider using httpOnly cookies instead.
 */

const TOKEN_KEY = 'auth_token';

/**
 * Store token in localStorage
 * ⚠️ Security Note: localStorage is accessible to JavaScript and vulnerable to XSS
 * For production apps, use httpOnly cookies instead
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }
  return null;
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }
};

/**
 * Check if token exists
 */
export const hasToken = (): boolean => {
  return getToken() !== null;
};


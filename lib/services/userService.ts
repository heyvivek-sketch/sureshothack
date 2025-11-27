import { User, CreateUserInput } from '@/lib/types/user';
import { hashPassword, comparePassword } from '@/lib/utils/password';
import { v4 as uuidv4 } from 'uuid';

// In-memory user store (replace with database in production)
// Note: This will reset on serverless function cold starts
// For production, use a database like PostgreSQL, MongoDB, or Vercel Postgres
const users: User[] = [];

/**
 * Get all users (for debugging - remove in production)
 */
export const getAllUsers = (): Omit<User, 'password'>[] => {
  return users.map(({ password, ...user }) => user);
};

/**
 * Get user count (for debugging)
 */
export const getUserCount = (): number => {
  return users.length;
};

/**
 * Create a new user with proper VIP/Premium initialization
 */
export const createUser = async (input: CreateUserInput): Promise<Omit<User, 'password'>> => {
  // Normalize email for comparison
  const normalizedEmail = input.email.toLowerCase().trim();
  
  // Check if user already exists
  const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(input.password);

  // Create user with VIP/Premium defaults
  const newUser: User = {
    id: uuidv4(),
    email: normalizedEmail,
    fullName: input.fullName.trim(),
    password: hashedPassword,
    isPremium: false, // Default to false
    isVip: false,     // Default to false
    createdAt: new Date(),
  };

  // Add to array
  users.push(newUser);

  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Find user by email (case-insensitive)
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  
  if (!user) {
    return null;
  }
  
  return user;
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string): Promise<Omit<User, 'password'> | null> => {
  const user = users.find((u) => u.id === id);
  if (!user) {
    return null;
  }
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Verify user password
 */
export const verifyUserPassword = async (
  user: User,
  password: string
): Promise<boolean> => {
  return comparePassword(password, user.password);
};

/**
 * Update user VIP status
 */
export const updateUserVipStatus = async (
  userId: string,
  isVip: boolean
): Promise<Omit<User, 'password'>> => {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update VIP status
  users[userIndex].isVip = isVip;

  // Return updated user without password
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

/**
 * Update user Premium status
 */
export const updateUserPremiumStatus = async (
  userId: string,
  isPremium: boolean
): Promise<Omit<User, 'password'>> => {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update Premium status
  users[userIndex].isPremium = isPremium;

  // Return updated user without password
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

/**
 * Update both VIP and Premium status
 */
export const updateUserStatus = async (
  userId: string,
  updates: { isVip?: boolean; isPremium?: boolean }
): Promise<Omit<User, 'password'>> => {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update status fields
  if (updates.isVip !== undefined) {
    users[userIndex].isVip = updates.isVip;
  }
  if (updates.isPremium !== undefined) {
    users[userIndex].isPremium = updates.isPremium;
  }

  // Return updated user without password
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};


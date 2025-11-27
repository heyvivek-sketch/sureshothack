import { User, CreateUserInput } from '@/lib/types/user';
import { hashPassword, comparePassword } from '@/lib/utils/password';
import { v4 as uuidv4 } from 'uuid';

// In-memory user store (replace with database in production)
// Note: This will reset on serverless function cold starts
// For production, use a database like PostgreSQL, MongoDB, or Vercel Postgres
const users: User[] = [];

export const createUser = async (input: CreateUserInput): Promise<Omit<User, 'password'>> => {
  // Check if user already exists
  const existingUser = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(input.password);

  // Create user
  const newUser: User = {
    id: uuidv4(),
    email: input.email.toLowerCase(),
    fullName: input.fullName.trim(),
    password: hashedPassword,
    createdAt: new Date(),
  };

  users.push(newUser);

  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
};

export const findUserById = async (id: string): Promise<Omit<User, 'password'> | null> => {
  const user = users.find((u) => u.id === id);
  if (!user) {
    return null;
  }
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const verifyUserPassword = async (
  user: User,
  password: string
): Promise<boolean> => {
  return comparePassword(password, user.password);
};


import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/utils/jwt';

export interface AuthRequest extends NextRequest {
  user?: TokenPayload;
}

export const getAuthUser = (request: NextRequest): TokenPayload | null => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const requireAuth = (request: NextRequest): TokenPayload => {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
};


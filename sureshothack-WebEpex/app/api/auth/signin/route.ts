import { NextRequest, NextResponse } from 'next/server';
import { LoginInput } from '@/lib/types/user';
import { validateLoginInput } from '@/lib/utils/validation';
import { findUserByEmail, verifyUserPassword } from '@/lib/services/userService';
import { generateToken } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const body: LoginInput = await request.json();

    // Validate input
    const validation = validateLoginInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // Normalize email for search
    const normalizedEmail = body.email.toLowerCase().trim();

    // Find user by email (case-insensitive)
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyUserPassword(user, body.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user data with VIP/Premium status
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isPremium: user.isPremium ?? false,
        isVip: user.isVip ?? false,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}


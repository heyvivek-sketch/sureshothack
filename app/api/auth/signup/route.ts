import { NextRequest, NextResponse } from 'next/server';
import { CreateUserInput } from '@/lib/types/user';
import { validateSignupInput } from '@/lib/utils/validation';
import { createUser } from '@/lib/services/userService';
import { generateToken } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserInput = await request.json();

    // Validate input
    const validation = validateSignupInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // Create user (VIP/Premium defaults to false)
    const user = await createUser(body);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          isPremium: user.isPremium ?? false,
          isVip: user.isVip ?? false,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
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


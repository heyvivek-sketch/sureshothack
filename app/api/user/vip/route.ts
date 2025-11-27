import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { updateUserVipStatus, updateUserStatus } from '@/lib/services/userService';

/**
 * Update user VIP status
 * PUT /api/user/vip
 * Body: { isVip: boolean, isPremium?: boolean }
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = requireAuth(request);

    // Parse request body
    const body = await request.json();
    const { isVip, isPremium } = body;

    // Validate input
    if (typeof isVip !== 'boolean' && typeof isPremium !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          message: 'isVip or isPremium must be provided as boolean',
        },
        { status: 400 }
      );
    }

    // Update user status
    const updates: { isVip?: boolean; isPremium?: boolean } = {};
    if (typeof isVip === 'boolean') {
      updates.isVip = isVip;
    }
    if (typeof isPremium === 'boolean') {
      updates.isPremium = isPremium;
    }

    const updatedUser = await updateUserStatus(authUser.userId, updates);

    return NextResponse.json({
      success: true,
      message: 'User status updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}


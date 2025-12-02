import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from localStorage
  // For token blacklisting, you'd need Redis or a database
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}


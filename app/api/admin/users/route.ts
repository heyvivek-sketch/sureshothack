import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/utils/jwt';

async function requireAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) throw new Error('Unauthorized');
  const token = auth.slice(7);
  const payload = verifyToken(token);
  const admin = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, role: true } });
  if (!admin || admin.role !== 'ADMIN') throw new Error('Forbidden');
  return admin;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, fullName: true, role: true,
        isPremium: true, isVip: true, vipExpiresAt: true,
        createdAt: true, updatedAt: true,
        _count: { select: { gameSessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: message === 'Forbidden' ? 403 : 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { userId, isVip, isPremium, role, vipExpiresAt } = body;
    if (!userId) return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof isVip === 'boolean') data.isVip = isVip;
    if (typeof isPremium === 'boolean') data.isPremium = isPremium;
    if (role === 'USER' || role === 'ADMIN') data.role = role;
    if (vipExpiresAt === null) data.vipExpiresAt = null;
    else if (typeof vipExpiresAt === 'string') data.vipExpiresAt = new Date(vipExpiresAt);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, fullName: true, role: true, isPremium: true, isVip: true, vipExpiresAt: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: message === 'Forbidden' ? 403 : 400 });
  }
}

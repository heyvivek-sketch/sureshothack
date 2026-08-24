import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/utils/jwt';

async function requireAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) throw new Error('Unauthorized');
  const payload = verifyToken(auth.slice(7));
  const admin = await prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } });
  if (!admin || admin.role !== 'ADMIN') throw new Error('Forbidden');
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const [totalUsers, premiumUsers, vipUsers, totalSessions, pendingSessions, completedSessions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.count({ where: { isVip: true } }),
      prisma.gameSession.count(),
      prisma.gameSession.count({ where: { status: 'pending' } }),
      prisma.gameSession.count({ where: { status: 'completed' } }),
    ]);
    return NextResponse.json({ success: true, stats: { totalUsers, premiumUsers, vipUsers, totalSessions, pendingSessions, completedSessions } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: message === 'Forbidden' ? 403 : 401 });
  }
}

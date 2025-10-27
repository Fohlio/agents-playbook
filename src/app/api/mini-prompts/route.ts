import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const systemOnly = searchParams.get('systemOnly') === 'true';

  const miniPrompts = await prisma.miniPrompt.findMany({
    where: systemOnly
      ? { isSystemMiniPrompt: true }
      : { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(miniPrompts);
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const miniPrompts = await prisma.miniPrompt.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(miniPrompts);
}

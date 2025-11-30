import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin sees ALL tags (including soft-deleted)
  const tags = await prisma.tag.findMany({
    include: {
      creator: {
        select: { username: true, email: true }
      },
      _count: {
        select: { workflowTags: true, miniPromptTags: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(tags);
}

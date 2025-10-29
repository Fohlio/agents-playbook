import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { workflowTags: true, miniPromptTags: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(tags);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, color } = body;

  if (!name) {
    return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
  }

  const existingTag = await prisma.tag.findUnique({
    where: { name }
  });

  if (existingTag) {
    return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 });
  }

  const tag = await prisma.tag.create({
    data: { name, color: color || null }
  });

  return NextResponse.json(tag);
}

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

  const workflows = await prisma.workflow.findMany({
    where: systemOnly
      ? { isSystemWorkflow: true }
      : { userId: session.user.id },
    include: {
      _count: {
        select: { stages: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(workflows);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const workflow = await prisma.workflow.create({
    data: {
      userId: session.user.id,
      name: body.name || 'Untitled Workflow',
      description: body.description || null,
      yamlContent: null,
      visibility: 'PRIVATE',
      isActive: body.isActive || false,
    },
  });

  return NextResponse.json(workflow);
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, color } = body;

  if (name !== undefined) {
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        NOT: { id }
      }
    });

    if (existingTag) {
      return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 });
    }
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color })
    }
  });

  return NextResponse.json(tag);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await prisma.tag.delete({
    where: { id }
  });

  return NextResponse.json({ success: true });
}

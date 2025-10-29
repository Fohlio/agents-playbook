import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, color } = body;

  if (name !== undefined) {
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        NOT: { id: params.id }
      }
    });

    if (existingTag) {
      return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 });
    }
  }

  const tag = await prisma.tag.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color })
    }
  });

  return NextResponse.json(tag);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.tag.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ success: true });
}

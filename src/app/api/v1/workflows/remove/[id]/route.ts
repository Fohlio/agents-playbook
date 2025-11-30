import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.workflowReference.deleteMany({
      where: {
        userId: session.user.id,
        workflowId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing workflow from library:', error);
    return NextResponse.json(
      { error: 'Failed to remove workflow from library' },
      { status: 500 }
    );
  }
}

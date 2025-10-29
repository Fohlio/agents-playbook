import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.workflowReference.deleteMany({
      where: {
        userId: session.user.id,
        workflowId: params.id,
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

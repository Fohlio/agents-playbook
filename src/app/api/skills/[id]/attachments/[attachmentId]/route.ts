import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { deleteSkillAttachment } from '@/server/skills/attachment-service';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, attachmentId } = await params;

    // Verify skill exists and user has permission
    const skill = await prisma.skill.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    if (skill.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify attachment belongs to this skill
    const attachment = await prisma.skillAttachment.findUnique({
      where: { id: attachmentId },
      select: { skillId: true },
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    if (attachment.skillId !== id) {
      return NextResponse.json({ error: 'Attachment does not belong to this skill' }, { status: 400 });
    }

    const result = await deleteSkillAttachment(attachmentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill attachment:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}

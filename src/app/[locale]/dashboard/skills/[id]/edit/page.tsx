import { notFound } from 'next/navigation';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { SkillStudio } from '@/views/skill-studio/components/SkillStudio';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const { id } = await params;

  const skill = await prisma.skill.findUnique({
    where: { id, deletedAt: null },
    include: {
      tags: {
        select: { tagId: true },
      },
      models: {
        select: { modelId: true },
      },
      attachments: {
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
          createdAt: true,
        },
      },
    },
  });

  if (!skill) {
    notFound();
  }

  // Check permissions
  const isOwner = skill.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin && skill.visibility !== 'PUBLIC') {
    notFound();
  }

  const readOnly = !isOwner && !isAdmin;

  const initialData = {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    content: skill.content,
    visibility: skill.visibility as 'PUBLIC' | 'PRIVATE',
    tagIds: skill.tags.map((t) => t.tagId),
    modelIds: skill.models.map((m) => m.modelId),
    attachments: skill.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      fileSize: a.fileSize,
      mimeType: a.mimeType,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return <SkillStudio initialData={initialData} readOnly={readOnly} />;
}

import { notFound } from 'next/navigation';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { SkillDetailView } from '@/views/skill-studio/components/SkillDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SkillDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const { id } = await params;

  const skill = await prisma.skill.findUnique({
    where: { id, deletedAt: null },
    include: {
      user: {
        select: { id: true, username: true },
      },
      tags: {
        include: { tag: true },
      },
      models: {
        include: { model: true },
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

  // Check permissions for private skills
  const isOwner = skill.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin && skill.visibility !== 'PUBLIC') {
    notFound();
  }

  const data = {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    content: skill.content,
    visibility: skill.visibility as 'PUBLIC' | 'PRIVATE',
    createdAt: skill.createdAt.toISOString(),
    updatedAt: skill.updatedAt.toISOString(),
    isOwner,
    author: skill.user.username,
    tags: skill.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    models: skill.models.map((m) => ({ id: m.model.id, name: m.model.name })),
    attachments: skill.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      fileSize: a.fileSize,
      mimeType: a.mimeType,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return <SkillDetailView data={data} />;
}

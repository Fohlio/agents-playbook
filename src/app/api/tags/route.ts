import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

const createTagSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

export async function GET() {
  const tags = await prisma.tag.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(tags);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createTagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, color } = validation.data;

    // Check for existing tag (case-insensitive)
    const existing = await prisma.tag.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate soft-deleted tag
        const reactivated = await prisma.tag.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            color: color || existing.color
          }
        });
        return NextResponse.json(reactivated);
      }
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#3B82F6',
        createdBy: session.user.id
      }
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

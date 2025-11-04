import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const updatePromptSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  description: z.string().optional()
});

/**
 * PATCH /api/admin/system-prompts/[id]
 * Update a system mini-prompt content
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const body = await request.json();
    const validation = updatePromptSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, description } = validation.data;

    // Verify prompt exists and is a system prompt
    const existingPrompt = await prisma.miniPrompt.findUnique({
      where: { id: params.id }
    });

    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (!existingPrompt.isSystemMiniPrompt) {
      return NextResponse.json(
        { error: 'Only system prompts can be edited through this endpoint' },
        { status: 403 }
      );
    }

    // Update the prompt
    const updatedPrompt = await prisma.miniPrompt.update({
      where: { id: params.id },
      data: {
        content,
        ...(description !== undefined && { description })
      },
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('[API] Error updating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update system prompt' },
      { status: 500 }
    );
  }
}

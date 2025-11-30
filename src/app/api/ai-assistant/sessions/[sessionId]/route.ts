import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';

/**
 * GET /api/ai-assistant/sessions/[sessionId]
 *
 * Get a specific chat session with full message history
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;

    const chatSession = await prisma.aIChatSession.findFirst({
      where: {
        id: params.sessionId,
        userId: session.user.id,
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            description: true,
            complexity: true,
            includeMultiAgentChat: true,
            stages: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                name: true,
                description: true,
                color: true,
                withReview: true,
                order: true,
                miniPrompts: {
                  orderBy: { order: 'asc' },
                  select: {
                    order: true,
                    miniPrompt: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        content: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        miniPrompt: {
          select: {
            id: true,
            name: true,
            description: true,
            content: true,
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session: {
        id: chatSession.id,
        mode: chatSession.mode,
        workflowId: chatSession.workflowId,
        miniPromptId: chatSession.miniPromptId,
        totalTokens: chatSession.totalTokens,
        lastMessageAt: chatSession.lastMessageAt,
        createdAt: chatSession.createdAt,
        workflow: chatSession.workflow,
        miniPrompt: chatSession.miniPrompt,
      },
    });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-assistant/sessions/[sessionId]
 *
 * Delete a chat session
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;

    // Verify ownership before deleting
    const chatSession = await prisma.aIChatSession.findFirst({
      where: {
        id: params.sessionId,
        userId: session.user.id,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    await prisma.aIChatSession.delete({
      where: { id: params.sessionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Chat session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

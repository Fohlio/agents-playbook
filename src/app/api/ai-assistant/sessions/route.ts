import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { z } from 'zod';

/**
 * GET /api/ai-assistant/sessions
 *
 * Get all chat sessions for the current user
 * Query params: ?mode=workflow|mini-prompt (optional filter)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    const whereClause: { userId: string; mode?: string } = {
      userId: session.user.id,
    };

    if (mode && (mode === 'workflow' || mode === 'mini-prompt')) {
      whereClause.mode = mode;
    }

    const sessions = await prisma.aIChatSession.findMany({
      where: whereClause,
      select: {
        id: true,
        mode: true,
        workflowId: true,
        miniPromptId: true,
        totalTokens: true,
        lastMessageAt: true,
        _count: {
          select: { messages: true },
        },
        workflow: {
          select: {
            name: true,
          },
        },
        miniPrompt: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Transform to summary format
    const summaries = sessions.map((s) => ({
      id: s.id,
      mode: s.mode,
      workflowId: s.workflowId,
      miniPromptId: s.miniPromptId,
      workflowName: s.workflow?.name,
      miniPromptName: s.miniPrompt?.name,
      lastMessageAt: s.lastMessageAt,
      messageCount: s._count.messages,
      totalTokens: s.totalTokens,
    }));

    return NextResponse.json({ sessions: summaries });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-assistant/sessions
 *
 * Create a new chat session
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const schema = z.object({
      mode: z.enum(['workflow', 'mini-prompt']),
      workflowId: z.string().optional(),
      miniPromptId: z.string().optional(),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { mode, workflowId, miniPromptId } = validation.data;

    const chatSession = await prisma.aIChatSession.create({
      data: {
        userId: session.user.id,
        mode,
        workflowId: workflowId || null,
        miniPromptId: miniPromptId || null,
      },
    });

    return NextResponse.json({
      session: {
        id: chatSession.id,
        mode: chatSession.mode,
        workflowId: chatSession.workflowId,
        miniPromptId: chatSession.miniPromptId,
        totalTokens: chatSession.totalTokens,
        createdAt: chatSession.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

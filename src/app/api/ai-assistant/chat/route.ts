import { NextRequest } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { AgentPipeline } from '@/server/ai-chat/pipeline/AgentPipeline';
import type { AgentContext } from '@/server/ai-chat/pipeline/types';
import { decryptApiKey } from '@/server/auth/openai-key';
import { z } from 'zod';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * POST /api/ai-assistant/chat
 *
 * AI chat completion with tool calling, message persistence, and response chaining.
 * Uses user's OpenAI API key and GPT-4o model with Responses API.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's OpenAI API key and role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { openaiApiKey: true, role: true },
    });

    // For admin users, use system OpenAI API key from environment
    // For regular users, require their own API key (decrypt from database)
    let apiKey: string | undefined;
    if (user?.role === 'ADMIN') {
      apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return Response.json(
          {
            error: 'System OpenAI API key not configured',
            message: 'Contact system administrator',
          },
          { status: 500 }
        );
      }
    } else {
      const encryptedKey = user?.openaiApiKey;
      if (!encryptedKey) {
        return Response.json(
          {
            error: 'OpenAI API key not configured',
            message: 'Please add your OpenAI API key in settings',
          },
          { status: 400 }
        );
      }

      try {
        // Decrypt the API key before using it
        apiKey = await decryptApiKey(encryptedKey);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        return Response.json(
          {
            error: 'Failed to decrypt API key',
            message: 'Your API key may be corrupted. Please re-enter it in settings.',
          },
          { status: 500 }
        );
      }
    }

    const body = await request.json();

    // Validate request body (updated for non-streaming: single message string)
    const schema = z.object({
      message: z.string().min(1, 'Message cannot be empty'),
      workflowContext: z
        .object({
          workflow: z.any().optional(),
          availableMiniPrompts: z.array(z.any()).optional(),
          currentMiniPrompt: z
            .object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable().optional(),
              content: z.string(),
            })
            .optional(),
          mode: z.enum(['workflow', 'mini-prompt']).optional(),
        })
        .optional(),
      mode: z.enum(['workflow', 'mini-prompt']),
      sessionId: z.string().optional().nullable(),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        {
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { message, workflowContext, mode, sessionId } = validation.data;

    // Build agent context
    const agentContext: AgentContext = {
      userId: session.user.id,
      mode,
      message,
      workflowContext,
      sessionId,
      apiKey,
    };

    // Create and execute pipeline
    const pipeline = AgentPipeline.forCompletion();
    const result = await pipeline.execute(agentContext);

    // Return complete response
    return Response.json(result);
  } catch (error) {
    console.error('Error in AI chat:', error);

    // Check for OpenAI API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      if (status === 401) {
        return Response.json(
          {
            error: 'Invalid OpenAI API key',
            message: 'Your API key is invalid or expired. Please update it in settings.',
          },
          { status: 400 }
        );
      }
    }

    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

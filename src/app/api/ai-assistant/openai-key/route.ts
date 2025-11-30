import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import {
  encryptApiKey,
  validateOpenAIKeyFormat,
  testOpenAIKey,
} from '@/server/auth/openai-key';
import { z } from 'zod';

/**
 * GET /api/ai-assistant/openai-key
 *
 * Check if the user has an OpenAI API key configured
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        openaiApiKey: true,
        openaiApiKeyUpdatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hasKey: !!user.openaiApiKey,
      updatedAt: user.openaiApiKeyUpdatedAt,
    });
  } catch (error) {
    console.error('Error checking OpenAI key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-assistant/openai-key
 *
 * Save or update the user's OpenAI API key
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
      apiKey: z.string().min(1, 'API key is required'),
      testConnection: z.boolean().optional().default(true),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { apiKey, testConnection } = validation.data;

    // Validate key format
    if (!validateOpenAIKeyFormat(apiKey)) {
      return NextResponse.json(
        {
          error: 'Invalid API key format',
          message: 'Expected format: sk-... or sk-proj-...',
        },
        { status: 400 }
      );
    }

    // Test the key if requested
    if (testConnection) {
      const testResult = await testOpenAIKey(apiKey);

      if (!testResult.valid) {
        return NextResponse.json(
          {
            error: 'API key validation failed',
            message: testResult.error || 'Failed to validate API key with OpenAI',
          },
          { status: 400 }
        );
      }
    }

    // Encrypt and save the key
    const encryptedKey = await encryptApiKey(apiKey);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        openaiApiKey: encryptedKey,
        openaiApiKeyUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'OpenAI API key saved successfully',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving OpenAI key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-assistant/openai-key
 *
 * Remove the user's OpenAI API key
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        openaiApiKey: null,
        openaiApiKeyUpdatedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'OpenAI API key removed successfully',
    });
  } catch (error) {
    console.error('Error removing OpenAI key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

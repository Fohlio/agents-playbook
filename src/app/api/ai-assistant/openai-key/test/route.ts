import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateOpenAIKeyFormat, testOpenAIKey } from '@/lib/auth/openai-key';

/**
 * POST /api/ai-assistant/openai-key/test
 *
 * Test an OpenAI API key without saving it
 * Used for validation during key setup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const schema = z.object({
      apiKey: z.string().min(1, 'API key is required'),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { apiKey } = validation.data;

    // Validate format first
    if (!validateOpenAIKeyFormat(apiKey)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid API key format. Expected: sk-... or sk-proj-...',
        },
        { status: 200 } // Return 200 with valid:false for client handling
      );
    }

    // Test the key
    const testResult = await testOpenAIKey(apiKey);

    if (!testResult.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: testResult.error || 'Failed to validate API key',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'API key is valid and working',
    });
  } catch (error) {
    console.error('Error testing OpenAI key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

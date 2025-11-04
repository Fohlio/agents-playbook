import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/admin/system-prompts
 * Get all system mini-prompts for admin management
 */
export async function GET() {
  try {
    const session = await auth();

    // Check admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all system mini-prompts
    const prompts = await prisma.miniPrompt.findMany({
      where: {
        isSystemMiniPrompt: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('[API] Error fetching system prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system prompts' },
      { status: 500 }
    );
  }
}

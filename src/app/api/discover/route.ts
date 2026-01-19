/**
 * Discover API Route
 *
 * Returns public workflows and prompts for the Discover tab.
 * Supports optional search query parameter.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicWorkflows, getPublicPrompts } from '@/views/library/services/discover-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || undefined;

  try {
    const [workflows, prompts] = await Promise.all([
      getPublicWorkflows(search),
      getPublicPrompts(search),
    ]);

    return NextResponse.json({
      workflows,
      prompts,
    });
  } catch (error) {
    console.error('[Discover API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public content' },
      { status: 500 }
    );
  }
}

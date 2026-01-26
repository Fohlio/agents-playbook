/**
 * Discover API Route
 *
 * Returns public workflows and skills for the Discover tab.
 * Supports optional search query parameter.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicWorkflows, getPublicSkills } from '@/views/library/services/discover-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || undefined;

  try {
    const [workflows, skills] = await Promise.all([
      getPublicWorkflows(search),
      getPublicSkills(search),
    ]);

    return NextResponse.json({
      workflows,
      skills,
    });
  } catch (error) {
    console.error('[Discover API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public content' },
      { status: 500 }
    );
  }
}

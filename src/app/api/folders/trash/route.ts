import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { getTrashedItems } from '@/server/folders';

/**
 * GET /api/folders/trash
 * Get all trashed items
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getTrashedItems(session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    items: result.data || [],
  });
}

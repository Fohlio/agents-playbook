import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { getUncategorizedItems } from '@/server/folders';

/**
 * GET /api/folders/uncategorized
 * Get all items not in any folder
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getUncategorizedItems(session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    workflows: result.data?.workflows || [],
    prompts: result.data?.prompts || [],
  });
}

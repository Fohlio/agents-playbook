import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { getFolderContents } from '@/server/folders';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/folders/[id]/contents
 * Get the contents of a folder (workflows and prompts)
 */
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const result = await getFolderContents(id, session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    workflows: result.data?.workflows || [],
    prompts: result.data?.prompts || [],
  });
}

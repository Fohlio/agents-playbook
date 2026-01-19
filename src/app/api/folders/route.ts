import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { getUserFolders, createFolder } from '@/server/folders';

/**
 * GET /api/folders
 * Get all folders for the authenticated user
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getUserFolders(session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ folders: result.data });
}

/**
 * POST /api/folders
 * Create a new folder
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await createFolder(
      {
        name: body.name,
        description: body.description,
        visibility: body.visibility,
        key: body.key,
      },
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ folder: result.data });
  } catch (error) {
    console.error('[POST /api/folders] Error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

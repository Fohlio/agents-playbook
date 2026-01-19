import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { getFolderById, updateFolder, deleteFolder } from '@/server/folders';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/folders/[id]
 * Get a single folder by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const result = await getFolderById(id, session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ folder: result.data });
}

/**
 * PATCH /api/folders/[id]
 * Update a folder
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateFolder(
      id,
      {
        name: body.name,
        description: body.description,
        visibility: body.visibility,
        key: body.key,
        position: body.position,
      },
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ folder: result.data });
  } catch (error) {
    console.error('[PATCH /api/folders/[id]] Error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

/**
 * DELETE /api/folders/[id]
 * Soft delete a folder (move to trash)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteFolder(id, session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getCommentByIdDirect, updateCommentApi, deleteCommentApi } from '@/services/comments';
import { UpdateCommentSchema } from '@/lib/validations/comment';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comment = await getCommentByIdDirect(Number(id));

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(comment, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error fetching comment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized (401)' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validation = UpdateCommentSchema.safeParse({
      ...body,
      id: Number(id),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateCommentApi(validation.data);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error updating comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized (401)' }, { status: 401 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: только администратор может удалять комментарии (403)' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteCommentApi(Number(id));
    return NextResponse.json({ success: true, id: Number(id) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error deleting comment' },
      { status: 500 }
    );
  }
}

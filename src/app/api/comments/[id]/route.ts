import { NextRequest, NextResponse } from 'next/server';
import { getCommentByIdDirect, updateCommentApi, deleteCommentApi } from '@/services/comments';

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
    const { id } = await params;
    const body = await request.json();

    const updated = await updateCommentApi({
      id: Number(id),
      body: body.body,
      postId: body.postId ? Number(body.postId) : undefined,
      username: body.username,
    });

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

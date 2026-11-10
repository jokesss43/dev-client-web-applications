import { NextRequest, NextResponse } from 'next/server';
import { getCommentsDirect, createCommentApi } from '@/services/comments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = Number(searchParams.get('skip')) || 0;

    const data = await getCommentsDirect(limit, skip);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.body || !body.username) {
      return NextResponse.json(
        { error: 'Body and username are required' },
        { status: 400 }
      );
    }

    const created = await createCommentApi({
      body: body.body,
      postId: Number(body.postId) || 1,
      username: body.username,
      userId: Number(body.userId) || 5,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}

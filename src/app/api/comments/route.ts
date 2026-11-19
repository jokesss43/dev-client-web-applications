import { NextRequest, NextResponse } from 'next/server';
import { getCommentsDirect, createCommentApi } from '@/services/comments';
import { CreateCommentSchema } from '@/lib/validations/comment';
import { getCurrentUser } from '@/lib/auth';

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
    // 1. Auth check
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: войдите в систему' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 2. Server Zod validation
    const validation = CreateCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const created = await createCommentApi(validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}

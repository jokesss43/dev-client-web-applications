import { Comment, CommentsApiResponse } from '@/types/comment';
import { CreateCommentInput, UpdateCommentInput, DummyJsonCommentsResponseSchema, DummyJsonCommentSchema } from '@/lib/validations/comment';
import { unstable_cache } from 'next/cache';

const DUMMY_JSON_URL = 'https://dummyjson.com';

const FALLBACK_COMMENTS: Comment[] = [
  {
    id: 1,
    body: "This is some awesome thinking!",
    postId: 242,
    likes: 3,
    user: { id: 105, username: "emilys", fullName: "Emily Johnson" }
  },
  {
    id: 2,
    body: "What terrific math skills you're showing!",
    postId: 46,
    likes: 4,
    user: { id: 183, username: "alexanderb", fullName: "Alexander Jones" }
  },
  {
    id: 3,
    body: "You are an amazing writer!",
    postId: 235,
    likes: 2,
    user: { id: 1, username: "michaelw", fullName: "Michael Williams" }
  },
  {
    id: 4,
    body: "How nice that you did that!",
    postId: 32,
    likes: 1,
    user: { id: 114, username: "sophiab", fullName: "Sophia Brown" }
  },
  {
    id: 5,
    body: "You're getting better every day.",
    postId: 14,
    likes: 8,
    user: { id: 121, username: "jamesd", fullName: "James Davis" }
  },
  {
    id: 6,
    body: "It is fabulous, I loved reading this!",
    postId: 88,
    likes: 5,
    user: { id: 75, username: "oliviag", fullName: "Olivia Garcia" }
  },
  {
    id: 7,
    body: "I really appreciate your creative effort here.",
    postId: 120,
    likes: 0,
    user: { id: 15, username: "liamm", fullName: "Liam Martinez" }
  },
  {
    id: 8,
    body: "Very insightful and well structured thoughts.",
    postId: 55,
    likes: 6,
    user: { id: 32, username: "charlottew", fullName: "Charlotte Wilson" }
  },
  {
    id: 9,
    body: "Great job! Keep up the good work.",
    postId: 19,
    likes: 9,
    user: { id: 98, username: "noaha", fullName: "Noah Anderson" }
  },
  {
    id: 10,
    body: "Thanks for sharing such a helpful perspective.",
    postId: 301,
    likes: 2,
    user: { id: 45, username: "avamt", fullName: "Ava Taylor" }
  }
];

export async function getCommentsDirect(limit: number = 10, skip: number = 0): Promise<CommentsApiResponse> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/comments?limit=${limit}&skip=${skip}`, {
      next: { revalidate: 60, tags: ['comments'] },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch comments: ${res.statusText}`);
    }

    const rawData = await res.json();
    
    // Validate API boundary with Zod
    const validated = DummyJsonCommentsResponseSchema.safeParse(rawData);
    if (!validated.success) {
      console.warn('API boundary validation warning:', validated.error.issues);
      return rawData;
    }

    return validated.data;
  } catch (error) {
    const slice = FALLBACK_COMMENTS.slice(skip, skip + limit);
    return {
      comments: slice,
      total: FALLBACK_COMMENTS.length,
      skip,
      limit,
    };
  }
}

export const getComments = unstable_cache(
  async (limit: number = 10, skip: number = 0) => getCommentsDirect(limit, skip),
  ['comments-list'],
  { revalidate: 60, tags: ['comments'] }
);

export async function getCommentByIdDirect(id: number): Promise<Comment | null> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/comments/${id}`, {
      next: { revalidate: 60, tags: [`comment-${id}`] },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch comment ${id}`);
    }

    const rawData = await res.json();
    const validated = DummyJsonCommentSchema.safeParse(rawData);
    return validated.success ? validated.data : rawData;
  } catch (error) {
    const found = FALLBACK_COMMENTS.find((c) => c.id === id);
    return found || null;
  }
}

export const getCommentById = unstable_cache(
  async (id: number) => getCommentByIdDirect(id),
  ['comment-detail'],
  { revalidate: 60 }
);

export async function createCommentApi(input: CreateCommentInput): Promise<Comment> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/comments/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: input.body,
        postId: input.postId,
        userId: input.userId ?? 5,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`API error creating comment: ${res.status}`);
    }

    const data = await res.json();
    return {
      ...data,
      likes: data.likes ?? 0,
      user: {
        id: data.user?.id ?? 5,
        username: input.username.trim() || data.user?.username || 'user',
        fullName: data.user?.fullName || input.username.trim() || 'User',
      },
    };
  } catch (error) {
    return {
      id: Date.now(),
      body: input.body,
      postId: input.postId,
      likes: 0,
      user: {
        id: input.userId ?? 5,
        username: input.username,
        fullName: input.username,
      },
    };
  }
}

export async function updateCommentApi(input: UpdateCommentInput): Promise<Comment> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/comments/${input.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: input.body,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        postId: input.postId ?? data.postId ?? 1,
        user: {
          ...data.user,
          username: input.username ?? data.user?.username ?? 'user',
        },
      };
    }
  } catch (error) {
    // fallback
  }

  return {
    id: input.id,
    body: input.body,
    postId: input.postId ?? 1,
    likes: 0,
    user: {
      id: 5,
      username: input.username ?? 'user',
      fullName: input.username ?? 'User',
    },
  };
}

export async function deleteCommentApi(id: number): Promise<{ success: boolean; id: number }> {
  try {
    await fetch(`${DUMMY_JSON_URL}/comments/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(4000),
    });
  } catch (error) {
    // simulated delete
  }

  return { success: true, id };
}

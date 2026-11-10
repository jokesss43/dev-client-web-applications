import { create } from 'zustand';
import { Comment, CreateCommentInput, UpdateCommentInput } from '@/types/comment';
import { addCommentAction, editCommentAction, deleteCommentAction } from '@/actions/comments';

interface CommentsState {
  comments: Comment[];
  total: number;
  skip: number;
  limit: number;
  searchQuery: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  isMutating: boolean;
  error: string | null;
  editingComment: Comment | null;

  // Actions
  initializeComments: (initialComments: Comment[], total: number, skip: number, limit: number) => void;
  setSearchQuery: (query: string) => void;
  setEditingComment: (comment: Comment | null) => void;
  loadMoreComments: () => Promise<void>;
  addComment: (input: CreateCommentInput) => Promise<{ success: boolean; error?: string }>;
  editComment: (input: UpdateCommentInput) => Promise<{ success: boolean; error?: string }>;
  deleteComment: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  total: 0,
  skip: 0,
  limit: 10,
  searchQuery: '',
  hasMore: true,
  isLoadingMore: false,
  isMutating: false,
  error: null,
  editingComment: null,

  initializeComments: (initialComments, total, skip, limit) => {
    set({
      comments: initialComments,
      total,
      skip: skip + initialComments.length,
      limit,
      hasMore: skip + initialComments.length < total,
      error: null,
    });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setEditingComment: (editingComment) => set({ editingComment }),

  loadMoreComments: async () => {
    const { skip, limit, isLoadingMore, hasMore, comments } = get();
    if (isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true, error: null });

    try {
      // Use Route Handler for client-side pagination / infinite query
      const res = await fetch(`/api/comments?limit=${limit}&skip=${skip}`);
      if (!res.ok) throw new Error('Ошибка при загрузке дополнительных комментариев');

      const data = await res.json();
      const newItems: Comment[] = data.comments;

      // Avoid duplicates
      const existingIds = new Set(comments.map((c) => c.id));
      const filteredNew = newItems.filter((c) => !existingIds.has(c.id));

      const updatedComments = [...comments, ...filteredNew];
      const nextSkip = skip + newItems.length;

      set({
        comments: updatedComments,
        skip: nextSkip,
        total: data.total,
        hasMore: nextSkip < data.total && newItems.length > 0,
        isLoadingMore: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Ошибка сети', isLoadingMore: false });
    }
  },

  addComment: async (input) => {
    set({ isMutating: true, error: null });

    // Optimistic comment creation
    const tempId = Date.now();
    const optimisticComment: Comment = {
      id: tempId,
      body: input.body,
      postId: input.postId,
      likes: 0,
      user: {
        id: input.userId ?? 5,
        username: input.username,
        fullName: input.username,
      },
    };

    // Optimistic update
    set((state) => ({
      comments: [optimisticComment, ...state.comments],
      total: state.total + 1,
    }));

    try {
      // Call Server Action
      const result = await addCommentAction(input);

      if (!result.success || !result.comment) {
        // Rollback optimistic update on failure
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== tempId),
          total: state.total - 1,
          isMutating: false,
          error: result.error || 'Не удалось создать комментарий',
        }));
        return { success: false, error: result.error };
      }

      // Replace optimistic item with server result
      set((state) => ({
        comments: state.comments.map((c) => (c.id === tempId ? result.comment! : c)),
        isMutating: false,
      }));

      return { success: true };
    } catch (err: any) {
      // Rollback
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== tempId),
        total: state.total - 1,
        isMutating: false,
        error: err.message || 'Сбой запроса',
      }));
      return { success: false, error: err.message };
    }
  },

  editComment: async (input) => {
    set({ isMutating: true, error: null });
    const { comments } = get();
    const original = comments.find((c) => c.id === input.id);

    // Optimistic update
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === input.id
          ? {
              ...c,
              body: input.body,
              postId: input.postId ?? c.postId,
              user: {
                ...c.user,
                username: input.username ?? c.user.username,
              },
            }
          : c
      ),
      editingComment: null,
    }));

    try {
      const result = await editCommentAction(input);
      if (!result.success) {
        // Rollback
        if (original) {
          set((state) => ({
            comments: state.comments.map((c) => (c.id === input.id ? original : c)),
            isMutating: false,
            error: result.error,
          }));
        }
        return { success: false, error: result.error };
      }

      set({ isMutating: false });
      return { success: true };
    } catch (err: any) {
      if (original) {
        set((state) => ({
          comments: state.comments.map((c) => (c.id === input.id ? original : c)),
          isMutating: false,
          error: err.message,
        }));
      }
      return { success: false, error: err.message };
    }
  },

  deleteComment: async (id) => {
    set({ isMutating: true, error: null });
    const { comments } = get();
    const original = comments.find((c) => c.id === id);

    // Optimistic deletion
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
      total: Math.max(0, state.total - 1),
    }));

    try {
      const result = await deleteCommentAction(id);
      if (!result.success) {
        // Rollback
        if (original) {
          set((state) => ({
            comments: [original, ...state.comments],
            total: state.total + 1,
            isMutating: false,
            error: result.error,
          }));
        }
        return { success: false, error: result.error };
      }

      set({ isMutating: false });
      return { success: true };
    } catch (err: any) {
      if (original) {
        set((state) => ({
          comments: [original, ...state.comments],
          total: state.total + 1,
          isMutating: false,
          error: err.message,
        }));
      }
      return { success: false, error: err.message };
    }
  },
}));

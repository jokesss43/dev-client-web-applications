'use client';

import { useEffect, useMemo } from 'react';
import { Comment } from '@/types/comment';
import { useCommentsStore } from '@/store/commentsStore';
import { CommentCard } from '@/components/CommentCard';
import { CommentSearch } from '@/components/CommentSearch';
import { CommentForm } from '@/components/CommentForm';
import { AuthUser } from '@/lib/auth';
import { MessageSquareOff, Loader2, ArrowDown, Sparkles } from 'lucide-react';

interface CommentsClientListProps {
  initialComments: Comment[];
  total: number;
  skip: number;
  limit: number;
  currentUser: AuthUser | null;
}

export function CommentsClientList({
  initialComments,
  total,
  skip,
  limit,
  currentUser,
}: CommentsClientListProps) {
  const {
    comments,
    initializeComments,
    setCurrentUser,
    searchQuery,
    hasMore,
    isLoadingMore,
    loadMoreComments,
    error,
  } = useCommentsStore();

  useEffect(() => {
    initializeComments(initialComments, total, skip, limit);
    setCurrentUser(currentUser);
  }, [initialComments, total, skip, limit, currentUser, initializeComments, setCurrentUser]);

  const filteredComments = useMemo(() => {
    if (!searchQuery.trim()) return comments;
    const query = searchQuery.toLowerCase().trim();
    return comments.filter(
      (c) =>
        c.body.toLowerCase().includes(query) ||
        c.user?.username?.toLowerCase().includes(query) ||
        c.user?.fullName?.toLowerCase().includes(query) ||
        String(c.postId).includes(query)
    );
  }, [comments, searchQuery]);

  return (
    <div>
      <CommentForm />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Список комментариев</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {filteredComments.length} {searchQuery ? 'найдено' : `из ${total}`}
          </span>
        </h2>
      </div>

      <CommentSearch />

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
          {error}
        </div>
      )}

      {filteredComments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-6">
          <MessageSquareOff className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            {searchQuery ? 'Ничего не найдено' : 'Комментариев пока нет'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `По запросу "${searchQuery}" комментариев не обнаружено.`
              : 'Будьте первым, кто оставит комментарий через форму выше!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {!searchQuery && (
        <div className="mt-8 text-center pb-6">
          {hasMore ? (
            <button
              onClick={() => loadMoreComments()}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-60"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Загрузка...</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Загрузить ещё (Route Handler)</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Все комментарии загружены ({comments.length} из {total})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

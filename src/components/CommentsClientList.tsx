'use client';

import { useEffect, useMemo } from 'react';
import { Comment } from '@/types/comment';
import { useCommentsStore } from '@/store/commentsStore';
import { CommentCard } from '@/components/CommentCard';
import { CommentSearch } from '@/components/CommentSearch';
import { CommentForm } from '@/components/CommentForm';
import { MessageSquareOff, Loader2, ArrowDown, Sparkles } from 'lucide-react';

interface CommentsClientListProps {
  initialComments: Comment[];
  total: number;
  skip: number;
  limit: number;
}

export function CommentsClientList({
  initialComments,
  total,
  skip,
  limit,
}: CommentsClientListProps) {
  const {
    comments,
    initializeComments,
    searchQuery,
    hasMore,
    isLoadingMore,
    loadMoreComments,
    error,
  } = useCommentsStore();

  // Initialize store with server data on mount
  useEffect(() => {
    initializeComments(initialComments, total, skip, limit);
  }, [initialComments, total, skip, limit, initializeComments]);

  // Filtered comments based on search query
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
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>Список комментариев</span>
          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {filteredComments.length} {searchQuery ? 'найдено' : `из ${total}`}
          </span>
        </h2>
      </div>

      <CommentSearch />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Empty State */}
      {filteredComments.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center my-6">
          <MessageSquareOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            {searchQuery ? 'Ничего не найдено' : 'Комментариев пока нет'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? `По запросу "${searchQuery}" комментариев не обнаружено. Попробуйте изменить параметры поиска.`
              : 'Будьте первым, кто оставит комментарий через форму выше!'}
          </p>
        </div>
      ) : (
        /* Comments Grid */
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* Pagination / Infinite Query Load More */}
      {!searchQuery && (
        <div className="mt-8 text-center pb-6">
          {hasMore ? (
            <button
              onClick={() => loadMoreComments()}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-800 text-sm font-semibold rounded-xl shadow-xs transition-all disabled:opacity-60"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Загрузка следующей страницы...</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 text-gray-500" />
                  <span>Загрузить ещё (Пагинация через Route Handler)</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Все комментарии загружены ({comments.length} из {total})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

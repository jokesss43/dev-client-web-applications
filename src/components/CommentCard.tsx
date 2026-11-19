'use client';

import Link from 'next/link';
import { Comment } from '@/types/comment';
import { useCommentsStore } from '@/store/commentsStore';
import { Heart, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  const { setEditingComment, deleteComment, isMutating, currentUser } = useCommentsStore();

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'user');
  const canDelete = currentUser && currentUser.role === 'admin';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canDelete) {
      alert('Удаление доступно только администраторам');
      return;
    }
    if (window.confirm(`Вы уверены, что хотите удалить комментарий #${comment.id}?`)) {
      await deleteComment(comment.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setEditingComment(comment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      data-testid={`comment-card-${comment.id}`}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              {(comment.user?.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span>@{comment.user?.username || 'anonymous'}</span>
                {comment.user?.fullName && (
                  <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                    ({comment.user.fullName})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                  Post #{comment.postId}
                </span>
                <span>•</span>
                <span>ID: {comment.id}</span>
              </div>
            </div>
          </div>

          {/* Action buttons with RBAC display */}
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={handleEdit}
                disabled={isMutating}
                title="Редактировать"
                aria-label={`Редактировать комментарий ${comment.id}`}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isMutating}
                title="Удалить (Только для Администратора)"
                aria-label={`Удалить комментарий ${comment.id}`}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-slate-800 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-line">
          {comment.body}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 text-rose-600 font-medium">
          <Heart className="w-3.5 h-3.5 fill-rose-50" />
          <span>{comment.likes ?? 0} лайков</span>
        </div>

        <Link
          href={`/comments/${comment.id}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          <span>Подробнее</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

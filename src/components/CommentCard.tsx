'use client';

import Link from 'next/link';
import { Comment } from '@/types/comment';
import { useCommentsStore } from '@/store/commentsStore';
import { Heart, Edit2, Trash2, ArrowUpRight, MessageSquare } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  const { setEditingComment, deleteComment, isMutating } = useCommentsStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm(`Вы уверены, что хотите удалить комментарий #${comment.id}?`)) {
      await deleteComment(comment.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditingComment(comment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm">
              {(comment.user?.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <span>@{comment.user?.username || 'anonymous'}</span>
                {comment.user?.fullName && (
                  <span className="text-xs text-gray-400 font-normal hidden sm:inline">
                    ({comment.user.fullName})
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                  Post #{comment.postId}
                </span>
                <span>•</span>
                <span>ID: {comment.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              disabled={isMutating}
              title="Редактировать"
              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isMutating}
              title="Удалить"
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-line">
          {comment.body}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1.5 text-rose-600 font-medium">
          <Heart className="w-3.5 h-3.5 fill-rose-50" />
          <span>{comment.likes ?? 0} лайков</span>
        </div>

        <Link
          href={`/comments/${comment.id}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <span>Страница записи</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

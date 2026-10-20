import type { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  onEdit: (comment: Comment) => void;
  onDelete: (id: number) => void;
}

export const CommentItem = ({ comment, onEdit, onDelete }: CommentItemProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold text-blue-600">@{comment.user?.username || 'user'}</span>
          <span className="text-xs text-gray-500 ml-2">Post ID: {comment.postId}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(comment)}
            className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
          >
            Изменить
          </button>
          <button
            onClick={() => onDelete(comment.id)}
            className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
      <p className="text-gray-800 mb-3">{comment.body}</p>
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <span>❤️ {comment.likes ?? 0} лайков</span>
      </div>
    </div>
  );
};
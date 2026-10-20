import { useState, useEffect } from 'react';
import type { Comment, CommentFormData } from './types';
import { CommentItem } from './components/CommentItem';
import { CommentForm } from './components/CommentForm';

function App() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch('https://dummyjson.com/comments?limit=10')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore) {
          setComments(data.comments);
          setError(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Не удалось загрузить комментарии. Проверьте подключение к интернету.');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleAddComment = async (formData: CommentFormData) => {
    try {
      // DummyJSON requires a valid userId (e.g. 5) to create a comment
      const response = await fetch('https://dummyjson.com/comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: formData.body,
          postId: formData.postId,
          userId: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении комментария');
      }

      const created: Comment = await response.json();
      const newComment: Comment = {
        ...created,
        likes: created.likes ?? 0,
        user: {
          id: created.user?.id ?? 5,
          username: formData.username.trim() || created.user?.username || 'user',
          fullName: created.user?.fullName || formData.username.trim() || 'User',
        },
      };

      setComments((prev) => [newComment, ...prev]);
    } catch {
      alert('Ошибка при добавлении комментария');
    }
  };

  const handleUpdateComment = async (formData: CommentFormData) => {
    if (!editingComment) return;
    try {
      const response = await fetch(`https://dummyjson.com/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: formData.body }),
      });

      let updatedComment: Comment;
      if (response.ok) {
        const data = await response.json();
        updatedComment = {
          ...editingComment,
          ...data,
          postId: formData.postId,
          user: {
            ...editingComment.user,
            username: formData.username.trim() || editingComment.user.username,
          },
        };
      } else {
        // Fallback for newly added local comments not present on the DummyJSON server
        updatedComment = {
          ...editingComment,
          body: formData.body,
          postId: formData.postId,
          user: {
            ...editingComment.user,
            username: formData.username.trim() || editingComment.user.username,
          },
        };
      }

      setComments((prev) =>
        prev.map((c) => (c.id === editingComment.id ? updatedComment : c))
      );
      setEditingComment(null);
    } catch {
      alert('Ошибка при обновлении комментария');
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) return;
    try {
      await fetch(`https://dummyjson.com/comments/${id}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.id !== id));
      if (editingComment?.id === id) {
        setEditingComment(null);
      }
    } catch {
      alert('Ошибка при удалении комментария');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Загрузка комментариев...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Управление комментариями (Вариант 7)
        </h1>

        <CommentForm
          key={editingComment ? `edit-${editingComment.id}` : 'new'}
          onSubmit={editingComment ? handleUpdateComment : handleAddComment}
          initialData={editingComment}
          onCancel={() => setEditingComment(null)}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Список комментариев ({comments.length})
          </h2>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Комментариев пока нет.</p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onEdit={setEditingComment}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useCommentsStore } from '@/store/commentsStore';
import { Send, Edit3, X, Loader2 } from 'lucide-react';

export function CommentForm() {
  const { editingComment, setEditingComment, addComment, editComment, isMutating } = useCommentsStore();

  const [username, setUsername] = useState('');
  const [postId, setPostId] = useState<number>(1);
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingComment) {
      setUsername(editingComment.user?.username || '');
      setPostId(editingComment.postId || 1);
      setBody(editingComment.body || '');
      setFormError(null);
    } else {
      setUsername('');
      setPostId(1);
      setBody('');
      setFormError(null);
    }
  }, [editingComment]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !body.trim()) {
      setFormError('Пожалуйста, заполните имя автора и текст комментария');
      return;
    }

    setFormError(null);

    if (editingComment) {
      const res = await editComment({
        id: editingComment.id,
        body: body.trim(),
        postId,
        username: username.trim(),
      });
      if (res.success) {
        setBody('');
        setUsername('');
      } else {
        setFormError(res.error || 'Ошибка при сохранении');
      }
    } else {
      const res = await addComment({
        body: body.trim(),
        postId,
        username: username.trim(),
        userId: 5,
      });
      if (res.success) {
        setBody('');
        setUsername('');
        setPostId(1);
      } else {
        setFormError(res.error || 'Ошибка при добавлении');
      }
    }
  };

  const handleCancel = () => {
    setEditingComment(null);
    setUsername('');
    setBody('');
    setPostId(1);
    setFormError(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {editingComment ? (
            <>
              <Edit3 className="w-5 h-5 text-amber-600" />
              <span>Редактировать комментарий #{editingComment.id}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-blue-600" />
              <span>Новый комментарий</span>
            </>
          )}
        </h3>
        {editingComment && (
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Отмена
          </button>
        )}
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Автор (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Например: alex_dev"
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isMutating}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              ID Поста (Post ID)
            </label>
            <input
              type="number"
              min={1}
              value={postId}
              onChange={(e) => setPostId(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isMutating}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            Текст комментария
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Напишите ваш комментарий..."
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isMutating}
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isMutating}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-all shadow-sm ${
              editingComment
                ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            }`}
          >
            {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingComment ? 'Сохранить изменения' : 'Опубликовать комментарий'}
          </button>

          {editingComment && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isMutating}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

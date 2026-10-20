import { useState, type FormEvent } from 'react';
import type { Comment, CommentFormData } from '../types';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
  initialData?: Comment | null;
  onCancel?: () => void;
}

export const CommentForm = ({ onSubmit, initialData, onCancel }: CommentFormProps) => {
  const [formData, setFormData] = useState<CommentFormData>(() => ({
    body: initialData?.body ?? '',
    postId: initialData?.postId ?? 1,
    username: initialData?.user?.username ?? '',
  }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.body.trim() || !formData.username.trim()) return;
    onSubmit(formData);
    if (!initialData) {
      setFormData({ body: '', postId: 1, username: '' });
    }
  };

  const handleCancel = () => {
    setFormData({ body: '', postId: 1, username: '' });
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {initialData ? 'Редактировать комментарий' : 'Добавить новый комментарий'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Например: emilys"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">ID Поста (postId)</label>
        <input
          type="number"
          value={formData.postId}
          onChange={(e) => setFormData({ ...formData, postId: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Текст комментария</label>
        <textarea
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Введите текст комментария..."
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Сохранить' : 'Добавить'}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
};
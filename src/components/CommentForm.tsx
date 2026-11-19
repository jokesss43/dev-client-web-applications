'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useCommentsStore } from '@/store/commentsStore';
import { CreateCommentSchema, UpdateCommentSchema } from '@/lib/validations/comment';
import { Send, Edit3, X, Loader2, AlertCircle, Lock } from 'lucide-react';

export function CommentForm() {
  const { editingComment, setEditingComment, addComment, editComment, isMutating, currentUser } = useCommentsStore();

  const [username, setUsername] = useState('');
  const [postId, setPostId] = useState<number>(1);
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (editingComment) {
      setUsername(editingComment.user?.username || '');
      setPostId(editingComment.postId || 1);
      setBody(editingComment.body || '');
      setFieldErrors({});
      setGeneralError(null);
    } else {
      setUsername(currentUser?.username || '');
      setPostId(1);
      setBody('');
      setFieldErrors({});
      setGeneralError(null);
    }
  }, [editingComment, currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Client-side Zod validation before request
    const payload = {
      username: username.trim(),
      postId: Number(postId),
      body: body.trim(),
    };

    if (editingComment) {
      const result = UpdateCommentSchema.safeParse({
        ...payload,
        id: editingComment.id,
      });

      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (!errors[field]) errors[field] = issue.message;
        });
        setFieldErrors(errors);
        return;
      }

      const res = await editComment({
        id: editingComment.id,
        body: payload.body,
        postId: payload.postId,
        username: payload.username,
      });

      if (res.success) {
        setBody('');
      } else {
        setGeneralError(res.error || 'Ошибка при сохранении комментария');
      }
    } else {
      const result = CreateCommentSchema.safeParse(payload);

      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (!errors[field]) errors[field] = issue.message;
        });
        setFieldErrors(errors);
        return;
      }

      const res = await addComment({
        body: payload.body,
        postId: payload.postId,
        username: payload.username,
        userId: currentUser?.id ?? 5,
      });

      if (res.success) {
        setBody('');
        setPostId(1);
      } else {
        setGeneralError(res.error || 'Ошибка при добавлении комментария');
      }
    }
  };

  const handleCancel = () => {
    setEditingComment(null);
    setBody('');
    setFieldErrors({});
    setGeneralError(null);
  };

  // If user is guest/anonymous, prompt to login
  if (!currentUser) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 mb-8 text-center">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Авторизуйтесь для публикации комментариев
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Гости могут только просматривать комментарии. Чтобы оставлять или редактировать записи, войдите в систему сверху.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 mb-8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {editingComment ? (
            <>
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>Редактировать комментарий #{editingComment.id}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-blue-600" />
              <span>Новый комментарий</span>
            </>
          )}
        </h3>
        {editingComment && (
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 font-medium"
          >
            <X className="w-3.5 h-3.5" /> Отмена
          </button>
        )}
      </div>

      {generalError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Автор (Username)
            </label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex_dev"
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                fieldErrors.username
                  ? 'border-rose-300 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-blue-500'
              }`}
              disabled={isMutating}
            />
            {fieldErrors.username && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              ID Поста (Post ID)
            </label>
            <input
              type="number"
              name="postId"
              min={1}
              value={postId}
              onChange={(e) => setPostId(Number(e.target.value))}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                fieldErrors.postId
                  ? 'border-rose-300 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-blue-500'
              }`}
              disabled={isMutating}
            />
            {fieldErrors.postId && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                {fieldErrors.postId}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Текст комментария
          </label>
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Напишите комментарий (минимум 5 символов, без спама)..."
            className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
              fieldErrors.body
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-200 focus:ring-blue-500'
            }`}
            disabled={isMutating}
          />
          {fieldErrors.body && (
            <p className="mt-1 text-[11px] text-rose-600 font-medium">
              {fieldErrors.body}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isMutating}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all shadow-xs ${
              editingComment
                ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            }`}
          >
            {isMutating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {editingComment ? 'Сохранить изменения' : 'Опубликовать'}
          </button>

          {editingComment && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isMutating}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

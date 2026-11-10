import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommentById } from '@/services/comments';
import { ArrowLeft, Heart, MessageSquare, UserCheck, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const comment = await getCommentById(Number(id));

  if (!comment) {
    return { title: 'Комментарий не найден' };
  }

  return {
    title: `Комментарий #${comment.id} от @${comment.user?.username || 'user'}`,
    description: comment.body.slice(0, 120),
  };
}

export default async function CommentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const comment = await getCommentById(Number(id));

  if (!comment) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к списку комментариев</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
              {(comment.user?.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>@{comment.user?.username || 'anonymous'}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  ID: #{comment.id}
                </span>
              </h1>
              {comment.user?.fullName && (
                <p className="text-sm text-gray-500">{comment.user.fullName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-rose-50 text-rose-700">
              <Heart className="w-4 h-4 fill-rose-100" />
              <span>{comment.likes ?? 0} лайков</span>
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Содержание комментария
            </h3>
            <div className="p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Идентификатор поста</span>
              </div>
              <div className="text-lg font-bold text-gray-900">Post #{comment.postId}</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>ID автора в системе</span>
              </div>
              <div className="text-lg font-bold text-gray-900">User #{comment.user?.id ?? 5}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

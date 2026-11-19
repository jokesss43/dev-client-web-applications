import { getComments } from '@/services/comments';
import { CommentsClientList } from '@/components/CommentsClientList';
import { AuthNavbar } from '@/components/AuthNavbar';
import { getCurrentUser } from '@/lib/auth';
import { MessageSquareText } from 'lucide-react';

export const metadata = {
  title: 'Управление комментариями — Лабораторная № 3',
  description: 'Next.js 16+ App Router, Zod validation, Auth RBAC, Vitest Component Testing',
};

export default async function HomePage() {
  const [data, currentUser] = await Promise.all([
    getComments(10, 0),
    getCurrentUser(),
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with Auth Widget */}
      <header className="mb-8 pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Система управления комментариями
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Лабораторная работа № 3 • Zod валидация • Auth RBAC • Тесты Vitest
            </p>
          </div>
        </div>

        <AuthNavbar />
      </header>

      {/* Client Component with interactive state & mutations */}
      <main>
        <CommentsClientList
          initialComments={data.comments}
          total={data.total}
          skip={data.skip}
          limit={data.limit}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
}

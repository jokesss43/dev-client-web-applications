import { getComments } from '@/services/comments';
import { CommentsClientList } from '@/components/CommentsClientList';
import { MessageSquareText } from 'lucide-react';

export const metadata = {
  title: 'Управление комментариями — Лабораторная № 2',
  description: 'Next.js 15+ App Router, Server Components, Zustand, Route Handlers, Server Actions',
};

// Server Component (RSC)
export default async function HomePage() {
  // Fetch initial comments directly on server
  const data = await getComments(10, 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Система управления комментариями
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Лабораторная работа № 2 • Вариант 7 (Comments) • Next.js App Router (RSC + Server Actions + Zustand)
            </p>
          </div>
        </div>
      </header>

      {/* Client Component with interactive state & mutations */}
      <main>
        <CommentsClientList
          initialComments={data.comments}
          total={data.total}
          skip={data.skip}
          limit={data.limit}
        />
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Лабораторная работа № 2 — Управление комментариями',
  description: 'Приложение для управления комментариями (Вариант 7: Comments) на Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-slate-50 text-slate-900 antialiased flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
          Лабораторная работа № 2 • Вариант 7 (Comments) • Next.js App Router
        </footer>
      </body>
    </html>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { isAuthenticated, user, checkAuth, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      // Still loading
    } else if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">AI Presentation Builder</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.email}</span>
          <button onClick={logout} className="text-red-500 hover:underline text-sm">
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Мои презентации</h2>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Создать презентацию
          </Link>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">У вас пока нет презентаций</h3>
          <p className="text-gray-500 mb-6">
            Загрузите файл или вставьте текст, чтобы создать первую презентацию
          </p>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block"
          >
            Создать презентацию
          </Link>
        </div>
      </main>
    </div>
  );
}

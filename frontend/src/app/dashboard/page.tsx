'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import './dashboard.css';

export default function DashboardPage() {
  const { isAuthenticated, user, checkAuth, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user !== null && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return (
      <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <Container>
          <div className="dashboard__header-inner">
            <h1 className="dashboard__title">Мои презентации</h1>
            <Link href="/create">
              <Button>+ Создать презентацию</Button>
            </Link>
          </div>
        </Container>
      </div>

      <div className="dashboard__content">
        <Container>
          {/* Empty state */}
          <div className="dashboard__empty">
            <div className="dashboard__empty-icon">📊</div>
            <h2 className="dashboard__empty-title">У вас пока нет презентаций</h2>
            <p className="dashboard__empty-text">
              Загрузите файл или вставьте текст, чтобы создать первую презентацию
            </p>
            <Link href="/create">
              <Button size="lg">Создать презентацию</Button>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
}

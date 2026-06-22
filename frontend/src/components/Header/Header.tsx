'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Container from '@/components/Container/Container';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="header">
      <Container>
        <div className="header__inner">
          <Link href="/" className="header__logo">
            <span className="header__logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </span>
            <span className="header__logo-text">AI Presentation Builder</span>
          </Link>

          {isAuthenticated ? (
            <nav className="header__nav">
              <Link href="/dashboard" className="header__link">
                Мои презентации
              </Link>
              <Link href="/create" className="header__link">
                Создать
              </Link>
              {(user as any)?.role === 'admin' && (
                <Link href="/admin" className="header__link">
                  Админка
                </Link>
              )}
              <span className="header__link header__email">
                {user?.email}
              </span>
              <button className="btn btn--ghost btn--sm" onClick={logout}>
                Выйти
              </button>
            </nav>
          ) : (
            <nav className="header__nav">
              <Link href="/pricing" className="header__link">Тарифы</Link>
              <a href="#features" className="header__link">Возможности</a>
              <a href="#faq" className="header__link">FAQ</a>
              <Link href="/login" className="header__link header__link--login">Войти</Link>
              <Link href="/register" className="btn btn--primary btn--sm">
                Регистрация
              </Link>
            </nav>
          )}
        </div>
      </Container>
    </header>
  );
}

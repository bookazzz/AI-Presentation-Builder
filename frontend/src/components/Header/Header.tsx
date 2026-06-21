'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import './Header.css';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="header">
      <Container>
        <div className="header__inner">
          <Link href="/" className="header__logo">
            <span className="header__logo-icon">AI</span>
            <span className="header__logo-text">Presentation Builder</span>
          </Link>

          {isAuthenticated ? (
            <nav className="header__nav">
              <Link href="/dashboard" className="header__link header__link--active">
                Мои презентации
              </Link>
              <Link href="/create" className="header__link">
                Создать
              </Link>
              {(user as any)?.role === 'admin' && (
                <Link href="/admin" className="header__link">
                  ⚙️ Админка
                </Link>
              )}
              <span className="header__link header__email" style={{ cursor: 'default', opacity: 0.6 }}>
                {user?.email}
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>
                Выйти
              </Button>
            </nav>
          ) : (
            <nav className="header__nav">
              <Link href="/login" className="header__link">
                Войти
              </Link>
              <Link href="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </nav>
          )}
        </div>
      </Container>
    </header>
  );
}

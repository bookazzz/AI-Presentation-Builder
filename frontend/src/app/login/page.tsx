'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import toast from 'react-hot-toast';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Вы вошли в систему');
      router.push('/dashboard');
    } catch {
      toast.error('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-form__title">Вход</h1>
        <p className="auth-form__subtitle">Войдите в аккаунт для работы с презентациями</p>

        <div className="auth-form__fields">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ваш пароль"
            required
          />
        </div>

        <div className="auth-form__submit">
          <Button type="submit" full disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </div>

        <p className="auth-form__footer">
          Нет аккаунта?{' '}
          <Link href="/register" className="auth-form__link">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}

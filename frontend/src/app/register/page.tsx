'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import toast from 'react-hot-toast';
import '../login/login.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Аккаунт создан!');
      router.push('/dashboard');
    } catch {
      toast.error('Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-form__title">Регистрация</h1>
        <p className="auth-form__subtitle">Создайте аккаунт для работы с сервисом</p>

        <div className="auth-form__fields">
          <Input
            label="Имя"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            required
          />
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
            placeholder="Минимум 6 символов"
            minLength={6}
            required
          />
        </div>

        <div className="auth-form__submit">
          <Button type="submit" full disabled={loading}>
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </Button>
        </div>

        <p className="auth-form__footer">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="auth-form__link">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}

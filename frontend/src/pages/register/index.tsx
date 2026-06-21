import { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Card from '@/components/Card/Card';
import styles from './register.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Заполните все поля');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    window.location.href = '/dashboard';
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Container>
          <Card className={styles.formCard}>
            <h1 className={styles.title}>Создать аккаунт</h1>
            <p className={styles.subtitle}>Начните создавать презентации бесплатно</p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Имя"
                type="text"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="example@mail.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Пароль"
                type="password"
                placeholder="Не менее 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" fullWidth>
                Зарегистрироваться
              </Button>
            </form>

            <div className={styles.links}>
              <span className={styles.text}>Уже есть аккаунт?</span>
              <a href="/login" className={styles.link}>Войти</a>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

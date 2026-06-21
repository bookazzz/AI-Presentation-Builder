import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '@/components/SEO/SEO';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import styles from './payment.module.css';

export default function PaymentSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className={styles.page}>
      <SEO title="Оплата прошла успешно" description="Спасибо за оплату! Ваш тариф активирован." noindex />
      <Header />
      <main className={styles.main}>
        <Container narrow>
          <div className={styles.content}>
            <div className={styles.icon}>✅</div>
            <h1 className={styles.title}>Оплата прошла успешно!</h1>
            <p className={styles.text}>
              Спасибо за покупку. Ваш тариф активирован, и вы можете пользоваться всеми преимуществами подписки.
            </p>
            <div className={styles.actions}>
              <Link href="/dashboard">
                <Button variant="primary" size="lg">Перейти в личный кабинет</Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" size="lg">Создать презентацию</Button>
              </Link>
            </div>
            <p className={styles.redirect}>
              Автоматический переход через {countdown} сек.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

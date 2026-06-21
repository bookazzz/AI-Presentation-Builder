import Link from 'next/link';
import SEO from '@/components/SEO/SEO';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import styles from './payment.module.css';

export default function PaymentFailed() {
  return (
    <div className={styles.page}>
      <SEO title="Оплата не прошла" description="Платёж не был завершён. Попробуйте ещё раз." noindex />
      <Header />
      <main className={styles.main}>
        <Container narrow>
          <div className={styles.content}>
            <div className={styles.icon}>❌</div>
            <h1 className={styles.title}>Оплата не прошла</h1>
            <p className={styles.text}>
              К сожалению, платёж не был завершён. Это могло произойти из-за технической ошибки
              или отмены на стороне платёжной системы. Пожалуйста, попробуйте ещё раз.
            </p>
            <p className={styles.text}>
              Если средства были списаны, но доступ к тарифу не открылся — напишите нам,
              и мы разберёмся в течение 24 часов.
            </p>
            <div className={styles.actions}>
              <Link href="/pricing">
                <Button variant="primary" size="lg">Попробовать снова</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">Вернуться в личный кабинет</Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

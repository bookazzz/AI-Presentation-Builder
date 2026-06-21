import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import styles from './404.module.css';

export default function Custom404() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Container>
          <div className={styles.content}>
            <div className={styles.code}>404</div>
            <h1 className={styles.title}>Страница не найдена</h1>
            <p className={styles.description}>
              Возможно, она была перемещена или удалена.<br />
              Попробуйте вернуться на главную или создать презентацию.
            </p>
            <div className={styles.actions}>
              <Link href="/" passHref legacyBehavior>
                <Button variant="primary" size="large">
                  На главную
                </Button>
              </Link>
              <Link href="/create" passHref legacyBehavior>
                <Button variant="secondary" size="large">
                  Создать презентацию
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

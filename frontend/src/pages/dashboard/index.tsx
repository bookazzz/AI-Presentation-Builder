import { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import PresentationCard from '@/components/PresentationCard/PresentationCard';
import styles from './dashboard.module.css';

interface Presentation {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'completed' | 'generating' | 'error';
  slidesCount: number;
  createdAt: string;
  thumbnail?: string;
}

const mockPresentations: Presentation[] = [
  {
    id: '1',
    title: 'Отчёт по продажам Q2 2026',
    type: 'Отчёт',
    status: 'completed',
    slidesCount: 12,
    createdAt: '2026-06-15',
  },
  {
    id: '2',
    title: 'Pitch Deck — Terra Game',
    type: 'Pitch Deck',
    status: 'draft',
    slidesCount: 8,
    createdAt: '2026-06-18',
  },
];

export default function Dashboard() {
  const [presentations, setPresentations] = useState<Presentation[]>(mockPresentations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // В будущем — загрузка с API
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Всего презентаций', value: presentations.length },
    { label: 'Создано в этом месяце', value: 2 },
    { label: 'Доступно по тарифу', value: '20 / мес' },
    { label: 'Экспортировано PPTX', value: 3 },
  ];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <Container>
          {/* Хедер дашборда */}
          <div className={styles.dashboardHeader}>
            <div>
              <h1 className={styles.title}>Мои презентации</h1>
              <p className={styles.subtitle}>
                Управляйте своими презентациями, создавайте новые и скачивайте готовые файлы
              </p>
            </div>
            <Button href="/create" variant="primary" size="l">
              + Создать презентацию
            </Button>
          </div>

          {/* Статистика */}
          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <Card key={i} variant="stats" className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </Card>
            ))}
          </div>

          {/* Список презентаций */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Последние презентации</h2>

            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Загрузка презентаций...</p>
              </div>
            ) : presentations.length === 0 ? (
              <Card variant="empty" className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <h3>Презентаций пока нет</h3>
                <p>Создайте первую презентацию — загрузите файл или вставьте текст</p>
                <Button href="/create" variant="primary">
                  Создать презентацию
                </Button>
              </Card>
            ) : (
              <div className={styles.presentationsGrid}>
                {presentations.map((p) => (
                  <PresentationCard
                    key={p.id}
                    title={p.title}
                    type={p.type}
                    status={p.status}
                    slidesCount={p.slidesCount}
                    createdAt={p.createdAt}
                    onView={() => {}}
                    onDownload={() => {}}
                    onDelete={() => {}}
                    onDuplicate={() => {}}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Быстрые действия */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Быстрые действия</h2>
            <div className={styles.quickActions}>
              <Card className={styles.actionCard} hoverable>
                <div className={styles.actionIcon}>📄</div>
                <h3>Из текстового файла</h3>
                <p>Загрузите TXT, DOCX или вставьте текст</p>
              </Card>
              <Card className={styles.actionCard} hoverable>
                <div className={styles.actionIcon}>📊</div>
                <h3>Из Excel</h3>
                <p>Загрузите XLSX или CSV с данными</p>
              </Card>
              <Card className={styles.actionCard} hoverable>
                <div className={styles.actionIcon}>🎯</div>
                <h3>Pitch Deck</h3>
                <p>Опишите стартап — получите готовую презентацию</p>
              </Card>
              <Card className={styles.actionCard} hoverable>
                <div className={styles.actionIcon}>📈</div>
                <h3>Отчётная презентация</h3>
                <p>Загрузите данные за период — получите аналитику</p>
              </Card>
            </div>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

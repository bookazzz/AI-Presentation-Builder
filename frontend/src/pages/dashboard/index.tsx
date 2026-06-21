import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import PresentationCard from '@/components/PresentationCard/PresentationCard';
import { useAuthStore } from '@/store/authStore';
import { getPresentations, deletePresentation, getDownloadUrl, exportPresentation, createPresentation, type Presentation } from '@/lib/presentations';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPresentations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getPresentations();
      setPresentations(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push('/login');
        return;
      }
      setError('Не удалось загрузить презентации');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadPresentations();
  }, [isAuthenticated, loadPresentations, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить презентацию?')) return;
    try {
      await deletePresentation(id);
      setPresentations((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Ошибка при удалении');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const result = await exportPresentation(id, 'pptx');
      window.open(getDownloadUrl(result.id), '_blank');
    } catch {
      setError('Ошибка при экспорте');
    }
  };

  const handleDuplicate = async (pres: Presentation) => {
    try {
      await createPresentation({
        title: `${pres.title} (копия)`,
        type: pres.type,
        audience: pres.audience || 'client',
        style: pres.style || 'business',
        language: pres.language || 'ru',
        slides_count: pres.slides_count || 10,
      });
      await loadPresentations();
    } catch {
      setError('Ошибка при дублировании');
    }
  };

  const thisMonthPresentations = presentations.filter((p) => {
    const d = new Date(p.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Всего презентаций', value: presentations.length },
    { label: 'Создано в этом месяце', value: thisMonthPresentations },
    { label: 'Доступно по тарифу', value: '20 / мес' },
    { label: 'Готовых к экспорту', value: presentations.filter((p) => p.status === 'completed').length },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <Container>
          <div className={styles.dashboardHeader}>
            <div>
              <h1 className={styles.title}>Мои презентации</h1>
              <p className={styles.subtitle}>
                Управляйте своими презентациями, создавайте новые и скачивайте готовые файлы
              </p>
            </div>
            <Link href="/create">
              <Button variant="primary" size="lg">+ Создать презентацию</Button>
            </Link>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <Button variant="ghost" size="sm" onClick={loadPresentations}>Повторить</Button>
            </div>
          )}

          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <Card key={i} className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </Card>
            ))}
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Последние презентации</h2>

            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Загрузка презентаций...</p>
              </div>
            ) : presentations.length === 0 ? (
              <Card className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <h3>Презентаций пока нет</h3>
                <p>Создайте первую презентацию — загрузите файл или вставьте текст</p>
                <Link href="/create">
                  <Button variant="primary">Создать презентацию</Button>
                </Link>
              </Card>
            ) : (
              <div className={styles.presentationsGrid}>
                {presentations.map((p) => (
                  <div key={p.id} className={styles.presCard}>
                    <PresentationCard
                      id={p.id}
                      title={p.title}
                      type={p.type}
                      status={p.status}
                      slidesCount={p.slides_count}
                      createdAt={new Date(p.created_at).toLocaleDateString('ru-RU')}
                      onView={(id) => router.push(`/edit?id=${id}`)}
                      onDownload={(id) => handleDownload(id)}
                      onDelete={(id) => handleDelete(id)}
                    />
                    <div className={styles.presActions}>
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicate(p)}>
                        Дублировать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Быстрые действия</h2>
            <div className={styles.quickActions}>
              <Card hover className={styles.actionCard}>
                <div className={styles.actionIcon}>📄</div>
                <h3>Из текстового файла</h3>
                <p>Загрузите TXT, DOCX или вставьте текст</p>
              </Card>
              <Card hover className={styles.actionCard}>
                <div className={styles.actionIcon}>📊</div>
                <h3>Из Excel</h3>
                <p>Загрузите XLSX или CSV с данными</p>
              </Card>
              <Card hover className={styles.actionCard}>
                <div className={styles.actionIcon}>🎯</div>
                <h3>Pitch Deck</h3>
                <p>Опишите стартап — получите готовую презентацию</p>
              </Card>
              <Card hover className={styles.actionCard}>
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

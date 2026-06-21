import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '@/components/SEO/SEO';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import styles from './pricing.module.css';

interface Plan {
  id: string;
  name: string;
  price: number;
  presentations_limit: number;
  slides_limit: number;
  max_file_size: number;
  pptx_export_enabled: boolean;
  pdf_export_enabled: boolean;
  watermark_enabled: boolean;
}

const planFeatures: Record<string, string[]> = {
  Free: ['1 презентация в месяц', 'До 8 слайдов', 'Экспорт PDF', 'Водяной знак', 'Базовые шаблоны'],
  Start: ['20 презентаций в месяц', 'До 25 слайдов', 'Экспорт PPTX + PDF', 'Без водяного знака', 'Работа с Excel'],
  PRO: ['100 презентаций в месяц', 'До 50 слайдов', 'Расширенные шаблоны', 'Брендбук и логотип', 'Заметки спикера'],
  Business: ['Безлимит презентаций', 'До 100 слайдов', 'Командный доступ', 'История версий', 'Индивидуальные шаблоны'],
};

export default function Pricing() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPlans() {
      try {
        const { data } = await api.get('/billing/plans');
        const sorted = data.sort((a: Plan, b: Plan) => a.price - b.price);
        setPlans(sorted);
      } catch {
        setError('Не удалось загрузить тарифы');
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.price === 0) {
      router.push('/register');
      return;
    }
    if (!isAuthenticated) {
      router.push(`/login?redirect=/pricing`);
      return;
    }
    setCheckoutLoading(plan.id);
    setError('');
    try {
      const { data } = await api.post('/billing/checkout', { plan_id: plan.id });
      window.location.href = data.confirmation_url;
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Ошибка при создании платежа';
      setError(msg);
      setCheckoutLoading(null);
    }
  };

  const highlightedPlan = (name: string) => name === 'Start';

  return (
    <div className={styles.page}>
      <SEO
        title="Тарифы — AI Presentation Builder"
        description="Выберите подходящий тариф для создания AI-презентаций. От бесплатного до корпоративного."
        canonical="https://bookazzz.github.io/AI-Presentation-Builder/pricing"
      />
      <Header />

      <main className={styles.main}>
        <Container narrow>
          <section className={styles.header}>
            <h1 className={styles.title}>Тарифы</h1>
            <p className={styles.subtitle}>Начните бесплатно, расширяйте по мере роста</p>
          </section>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError('')}>Закрыть</Button>
            </div>
          )}

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Загрузка тарифов...</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {plans.map((plan) => {
                const isHighlighted = highlightedPlan(plan.name);
                const features = planFeatures[plan.name] || [];
                return (
                  <Card
                    key={plan.id}
                    className={`${styles.card} ${isHighlighted ? styles.highlighted : ''}`}
                  >
                    {isHighlighted && <span className={styles.badge}>Популярный</span>}
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        {plan.price === 0 ? '0' : plan.price.toLocaleString('ru-RU')}
                      </span>
                      <span className={styles.period}>
                        {plan.price === 0 ? ' ₽' : ' ₽/мес'}
                      </span>
                    </div>
                    <ul className={styles.features}>
                      {features.map((f, i) => (
                        <li key={i} className={styles.featureItem}>✓ {f}</li>
                      ))}
                    </ul>
                    <Button
                      variant={isHighlighted ? 'primary' : 'outline'}
                      full
                      disabled={checkoutLoading === plan.id}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {checkoutLoading === plan.id
                        ? 'Перенаправление...'
                        : plan.price === 0
                          ? 'Начать бесплатно'
                          : 'Выбрать тариф'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}

          <section className={styles.faq}>
            <h2 className={styles.faqTitle}>Часто задаваемые вопросы</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>Можно ли перейти на другой тариф?</h4>
                <p>Да, вы можете сменить тариф в любой момент. Остаток по предыдущему тарифу не сгорает.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>Как отменить подписку?</h4>
                <p>Подписку можно отменить в личном кабинете. Доступ к платным функциям сохраняется до конца оплаченного периода.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>Какие способы оплаты принимаются?</h4>
                <p>Банковские карты (Visa, Mastercard, МИР), СБП, ЮMoney — через платёжную систему ЮKassa.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>Есть ли возврат?</h4>
                <p>Мы возвращаем средства в течение 14 дней с момента оплаты, если вы не создали ни одной презентации.</p>
              </div>
            </div>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

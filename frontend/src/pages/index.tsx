import { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import styles from './page.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faq: FAQItem[] = [
  {
    question: 'Какие форматы файлов поддерживаются?',
    answer: 'TXT, DOCX, XLSX, CSV. Максимальный размер файла — 20 МБ.',
  },
  {
    question: 'Сколько времени занимает генерация?',
    answer: 'Обычно 1–2 минуты для презентации до 15 слайдов.',
  },
  {
    question: 'Можно ли редактировать презентацию после генерации?',
    answer: 'Да, встроенный редактор позволяет менять текст, заголовки, порядок слайдов и дизайн.',
  },
  {
    question: 'Какие форматы экспорта доступны?',
    answer: 'PPTX и PDF. На платных тарифах — без водяного знака.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '0 ₽',
    period: 'навсегда',
    features: ['1 презентация в месяц', 'До 8 слайдов', 'Экспорт PDF', 'Водяной знак', 'Базовые шаблоны'],
    highlighted: false,
    cta: 'Начать бесплатно',
  },
  {
    name: 'Start',
    price: '990 ₽',
    period: '/мес',
    features: ['20 презентаций в месяц', 'До 25 слайдов', 'Экспорт PPTX + PDF', 'Без водяного знака', 'Работа с Excel'],
    highlighted: true,
    cta: 'Выбрать тариф',
  },
  {
    name: 'PRO',
    price: '2 990 ₽',
    period: '/мес',
    features: ['100 презентаций в месяц', 'До 50 слайдов', 'Расширенные шаблоны', 'Брендбук и логотип', 'Заметки спикера'],
    highlighted: false,
    cta: 'Выбрать тариф',
  },
  {
    name: 'Business',
    price: '9 900 ₽',
    period: '/мес',
    features: ['Безлимит презентаций', 'До 100 слайдов', 'Командный доступ', 'История версий', 'Индивидуальные шаблоны'],
    highlighted: false,
    cta: 'Связаться с нами',
  },
];

const steps = [
  { number: '01', title: 'Загрузите файл', desc: 'TXT, DOCX, XLSX или CSV. Или просто вставьте текст.' },
  { number: '02', title: 'Выберите тип и стиль', desc: 'Бизнес-презентация, Pitch Deck, отчёт — под любой формат.' },
  { number: '03', title: 'Получите готовую презентацию', desc: 'Скачайте PPTX или PDF с графиками, выводами и дизайном.' },
];

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <Header />

      {/* Hero */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Загрузите текст или Excel —<br />
              <span className={styles.heroHighlight}>получите готовую презентацию</span>
              <br />за несколько минут
            </h1>
            <p className={styles.heroSubtitle}>
              AI превращает сырой материал в бизнес-презентацию с логикой, структурой, 
              графиками и выводами. Без PowerPoint и дизайнеров.
            </p>
            <div className={styles.heroActions}>
              <Button href="/create" variant="primary" size="l">
                Создать презентацию
              </Button>
              <Button href="/presentation-demo" variant="outline" size="l">
                Посмотреть демо
              </Button>
            </div>
            <div className={styles.heroFormats}>
              Поддерживаемые форматы: <strong>TXT</strong> · <strong>DOCX</strong> · <strong>XLSX</strong> · <strong>CSV</strong>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Как это работает</h2>
          <p className={styles.sectionSubtitle}>Три шага от файла до готовой презентации</p>
          <div className={styles.stepsGrid}>
            {steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <h2 className={styles.sectionTitle}>Возможности сервиса</h2>
          <div className={styles.featuresGrid}>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}>📄</div>
              <h3>Работа с текстом</h3>
              <p>Загрузите TXT или DOCX — AI выделит тезисы, структуру и ключевые мысли</p>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3>Excel-аналитика</h3>
              <p>Автоматическое построение графиков, KPI, сравнение периодов и выводы</p>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}>🎨</div>
              <h3>Шаблоны дизайна</h3>
              <p>8 стилей на любой вкус: деловой, инвестиционный, маркетинговый</p>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}>✏️</div>
              <h3>Редактор слайдов</h3>
              <p>Правите текст, меняете порядок и дизайн перед экспортом</p>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}>📥</div>
              <h3>Экспорт PPTX/PDF</h3>
              <p>Готовый файл, который открывается в PowerPoint без искажений</p>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}>📋</div>
              <h3>Типы презентаций</h3>
              <p>Pitch Deck, отчёт, коммерческое предложение, обучение — своя структура</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className={styles.section} id="pricing">
        <Container>
          <h2 className={styles.sectionTitle}>Тарифы</h2>
          <p className={styles.sectionSubtitle}>Начните бесплатно, расширяйте по мере роста</p>
          <div className={styles.pricingGrid}>
            {plans.map((plan, i) => (
              <Card key={i} className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingHighlighted : ''}`}>
                {plan.highlighted && <span className={styles.pricingBadge}>Популярный</span>}
                <h3 className={styles.pricingName}>{plan.name}</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.pricingAmount}>{plan.price}</span>
                  <span className={styles.pricingPeriod}>{plan.period}</span>
                </div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j} className={styles.pricingFeature}>✓ {f}</li>
                  ))}
                </ul>
                <Button
                  href={plan.highlighted ? '/register?plan=start' : '/register'}
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  fullWidth
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className={`${styles.section} ${styles.ctaSection}`}>
        <Container>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Готовы попробовать?</h2>
            <p>Создайте первую презентацию бесплатно — без карты и регистрации</p>
            <Button href="/create" variant="primary" size="l">
              Создать презентацию
            </Button>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
          <div className={styles.faqList}>
            {faq.map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                >
                  {item.question}
                  <span className={styles.faqToggle}>{openFAQ === i ? '−' : '+'}</span>
                </button>
                {openFAQ === i && (
                  <div className={styles.faqAnswer}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}

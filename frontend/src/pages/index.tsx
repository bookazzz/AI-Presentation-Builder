import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SEO from '@/components/SEO/SEO';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
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
    answer: 'Обычно 1–2 минуты для презентации до 15 слайдов. Вы будете видеть прогресс на каждом этапе.',
  },
  {
    question: 'Можно ли редактировать презентацию после генерации?',
    answer: 'Да, встроенный редактор позволяет менять текст, заголовки, порядок слайдов и дизайн перед экспортом.',
  },
  {
    question: 'Какие форматы экспорта доступны?',
    answer: 'PPTX и PDF. На платных тарифах — без водяного знака и с расширенными шаблонами.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '0',
    period: '₽/мес',
    features: ['1 презентация в месяц', 'До 5 слайдов', 'Экспорт PDF', 'Базовые шаблоны'],
    highlighted: false,
    cta: 'Начать бесплатно',
  },
  {
    name: 'Start',
    price: '990',
    period: '₽/мес',
    features: ['20 презентаций в месяц', 'До 25 слайдов', 'Экспорт PPTX + PDF', 'Все шаблоны', 'Работа с Excel'],
    highlighted: true,
    cta: 'Выбрать тариф',
  },
  {
    name: 'PRO',
    price: '2 990',
    period: '₽/мес',
    features: ['100 презентаций в месяц', 'До 50 слайдов', 'Расширенные шаблоны', 'Брендбук и логотип', 'Приоритетная поддержка'],
    highlighted: false,
    cta: 'Выбрать тариф',
  },
  {
    name: 'Business',
    price: '9 900',
    period: '₽/мес',
    features: ['Безлимит презентаций', 'До 100 слайдов', 'Командный доступ', 'История версий', 'Индивидуальные шаблоны'],
    highlighted: false,
    cta: 'Связаться с нами',
  },
];

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Работа с текстом',
    desc: 'Загрузите TXT или DOCX — AI выделит тезисы, структуру и ключевые мысли',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Excel-аналитика',
    desc: 'Автоматическое построение графиков, KPI, сравнение периодов и выводы',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
    title: 'Шаблоны дизайна',
    desc: '8 стилей на любой вкус: деловой, инвестиционный, маркетинговый',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'Редактор слайдов',
    desc: 'Правите текст, меняете порядок и дизайн перед экспортом',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Экспорт PPTX/PDF',
    desc: 'Готовый файл, который открывается в PowerPoint без искажений',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Типы презентаций',
    desc: 'Pitch Deck, отчёт, коммерческое предложение, обучение — своя структура',
  },
];

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <SEO
        title="Создание презентаций из текста и Excel с помощью AI"
        description="AI Presentation Builder — превратите текст или Excel-файл в готовую бизнес-презентацию с графиками, выводами и дизайном за пару минут. PPTX и PDF экспорт."
        canonical="https://bookazzz.github.io/AI-Presentation-Builder/"
        ogType="website"
      />

      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI Presentation Builder",
            "url": "https://bookazzz.github.io/AI-Presentation-Builder/",
            "description": "Сервис, который превращает текстовые документы и Excel-отчёты в готовые бизнес-презентации с выводами, графиками и экспортом в PowerPoint.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            }
          })}
        </script>
      </Head>

      <Header />

      {/* Hero */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                AI для бизнеса
              </div>

              <h1 className={styles.heroTitle}>
                Загрузите текст или Excel —<br />
                получите готовую презентацию<br />
                <span className={styles.heroGradient}>за несколько минут</span>
              </h1>

              <p className={styles.heroSubtitle}>
                AI превращает сырой материал в бизнес-презентацию с логикой, структурой, 
                графиками и выводами. Без PowerPoint и дизайнеров.
              </p>

              <div className={styles.heroChecks}>
                <span className={styles.heroCheck}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Экономьте время
                </span>
                <span className={styles.heroCheck}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Профессиональный результат
                </span>
                <span className={styles.heroCheck}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Без дизайнера
                </span>
              </div>

              <div className={styles.heroActions}>
                <Link href="/create" className="btn btn--primary btn--lg">
                  Создать презентацию
                </Link>
                <Link href="/presentation-demo" className="btn btn--outline btn--lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Посмотреть демо
                </Link>
              </div>

              <div className={styles.heroFormats}>
                Поддерживаемые форматы: <strong>TXT</strong> · <strong>DOCX</strong> · <strong>XLSX</strong> · <strong>CSV</strong>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroTablet}>
                <div className={styles.tabletFrame}>
                  <div className={styles.tabletHeader}>
                    <span className={styles.tabletDot} />
                    <span className={styles.tabletDot} />
                    <span className={styles.tabletDot} />
                  </div>
                  <div className={styles.tabletContent}>
                    <div className={styles.chartRow}>
                      <div className={styles.chartPie}>
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#6c63ff" strokeWidth="20" strokeDasharray="125 126" strokeDashoffset="0" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#8b83ff" strokeWidth="20" strokeDasharray="80 171" strokeDashoffset="-80" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className={styles.chartBars}>
                        <div className={styles.bar} style={{ height: '70%' }} />
                        <div className={styles.bar} style={{ height: '45%' }} />
                        <div className={styles.bar} style={{ height: '85%' }} />
                        <div className={styles.bar} style={{ height: '55%' }} />
                        <div className={styles.bar} style={{ height: '90%' }} />
                      </div>
                    </div>
                    <div className={styles.chartLine}>
                      <svg viewBox="0 0 200 50" preserveAspectRatio="none">
                        <polyline
                          points="0,40 25,35 50,20 75,30 100,10 125,25 150,15 175,20 200,5"
                          fill="none"
                          stroke="#6c63ff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="0,40 25,35 50,20 75,30 100,10 125,25 150,15 175,20 200,5"
                          fill="url(#gradient)"
                          opacity="0.15"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6c63ff" />
                            <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className={styles.tabletShadow} />
              </div>

              <div className={styles.heroUpload}>
                <div className={styles.uploadIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span className={styles.uploadText}>Drag and drop</span>
                <span className={styles.uploadFormats}>TXT · DOCX · XLSX</span>
              </div>

              <div className={`${styles.floatingFile} ${styles.floatingFile1}`}>
                <svg width="16" height="20" viewBox="0 0 24 28" fill="none">
                  <rect x="2" y="1" width="20" height="26" rx="3" fill="#e0e7ff" stroke="#6c63ff" strokeWidth="1.5" />
                  <text x="6" y="18" fontSize="8" fontWeight="bold" fill="#6c63ff">TXT</text>
                </svg>
              </div>
              <div className={`${styles.floatingFile} ${styles.floatingFile2}`}>
                <svg width="16" height="20" viewBox="0 0 24 28" fill="none">
                  <rect x="2" y="1" width="20" height="26" rx="3" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
                  <text x="2" y="18" fontSize="7" fontWeight="bold" fill="#10b981">DOCX</text>
                </svg>
              </div>
              <div className={`${styles.floatingFile} ${styles.floatingFile3}`}>
                <svg width="16" height="20" viewBox="0 0 24 28" fill="none">
                  <rect x="2" y="1" width="20" height="26" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="5" y="18" fontSize="8" fontWeight="bold" fill="#f59e0b">XLSX</text>
                </svg>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className={styles.sectionAlt} id="features">
        <Container>
          <h2 className={styles.sectionTitle}>Как это работает</h2>
          <p className={styles.sectionSubtitle}>Три простых шага от файла до готовой презентации</p>
          <div className={styles.stepsRow}>
            <div className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className={styles.stepCardTitle}>Загрузите файл</h3>
              <p className={styles.stepCardDesc}>TXT, DOCX или XLSX. Или просто вставьте текст вручную.</p>
            </div>

            <div className={styles.stepArrow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className={styles.stepCardTitle}>Выберите стиль</h3>
              <p className={styles.stepCardDesc}>Бизнес-презентация, Pitch Deck, отчёт — под любой формат.</p>
            </div>

            <div className={styles.stepArrow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3 className={styles.stepCardTitle}>Получите презентацию</h3>
              <p className={styles.stepCardDesc}>Скачайте PPTX или PDF с графиками, выводами и дизайном.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Возможности сервиса</h2>
          <p className={styles.sectionSubtitle}>Всё необходимое для создания бизнес-презентаций</p>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className={styles.sectionAlt} id="pricing">
        <Container>
          <h2 className={styles.sectionTitle}>Тарифы</h2>
          <p className={styles.sectionSubtitle}>Начните бесплатно, расширяйте по мере роста</p>
          <div className={styles.pricingGrid}>
            {plans.map((plan, i) => (
              <div key={i} className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingCardHighlighted : ''}`}>
                {plan.highlighted && <span className={styles.pricingBadge}>Популярный</span>}
                <h3 className={styles.pricingName}>{plan.name}</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.pricingAmount}>{plan.price}</span>
                  <span className={styles.pricingPeriod}>{plan.period}</span>
                </div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j} className={styles.pricingFeature}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={`btn ${plan.highlighted ? 'btn--primary' : 'btn--outline'} btn--full`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <Container>
          <div className={styles.ctaContent}>
            <div className={styles.ctaIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <h2 className={styles.ctaTitle}>Готовы попробовать?</h2>
            <p className={styles.ctaText}>Создайте первую презентацию бесплатно — без карты и регистрации</p>
            <Link href="/create" className="btn btn--white btn--lg">
              Создать презентацию
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className={styles.section} id="faq">
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${styles.faqToggle} ${openFAQ === i ? styles.faqToggleOpen : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
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

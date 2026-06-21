import Link from 'next/link';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import './page.css';

const steps = [
  { number: 1, title: 'Загрузите файл', desc: 'TXT, DOCX, XLSX, CSV или PDF. Или просто вставьте текст.' },
  { number: 2, title: 'Настройте презентацию', desc: 'Выберите тип, стиль, аудиторию и количество слайдов.' },
  { number: 3, title: 'Скачайте результат', desc: 'Готовая презентация в PPTX или PDF с графиками и выводами.' },
];

const features = [
  { icon: '📝', title: 'Из текста в слайды', desc: 'Анализируем документ, выделяем тезисы и строим логичную структуру.' },
  { icon: '📊', title: 'Excel → графики', desc: 'Строим диаграммы, считаем метрики, формируем выводы.' },
  { icon: '🎨', title: '8+ стилей оформления', desc: 'Деловой, инвестиционный, маркетинговый, аналитический и другие.' },
  { icon: '✏️', title: 'Редактор слайдов', desc: 'Правите текст, меняете порядок, регенерируете слайды.' },
  { icon: '📎', title: 'PPTX / PDF экспорт', desc: 'Скачиваете готовый файл для PowerPoint.' },
  { icon: '☁️', title: 'История в личном кабинете', desc: 'Все презентации сохраняются, можно вернуться и скачать.' },
];

const plans = [
  {
    name: 'Free',
    desc: 'Для первых проб',
    price: '0',
    currency: '₽',
    period: '/мес',
    featured: false,
    badge: null,
    features: [
      { text: '1 презентация в месяц', ok: true },
      { text: 'До 8 слайдов', ok: true },
      { text: 'Экспорт PDF', ok: true },
      { text: 'Водяной знак', ok: true },
      { text: 'Базовые шаблоны', ok: true },
      { text: 'Экспорт PPTX', ok: false },
      { text: 'Работа с Excel', ok: false },
    ],
    cta: 'Начать бесплатно',
    href: '/register',
  },
  {
    name: 'Start',
    desc: 'Для регулярной работы',
    price: '990',
    currency: '₽',
    period: '/мес',
    featured: true,
    badge: 'Популярный',
    features: [
      { text: '20 презентаций в месяц', ok: true },
      { text: 'До 25 слайдов', ok: true },
      { text: 'Экспорт PPTX и PDF', ok: true },
      { text: 'Без водяного знака', ok: true },
      { text: 'Базовые + продвинутые шаблоны', ok: true },
      { text: 'Работа с Excel', ok: true },
      { text: 'Брендбук и логотип', ok: false },
    ],
    cta: 'Выбрать Start',
    href: '/register?plan=start',
  },
  {
    name: 'PRO',
    desc: 'Для профессионалов',
    price: '2 990',
    currency: '₽',
    period: '/мес',
    featured: false,
    badge: null,
    features: [
      { text: '100 презентаций в месяц', ok: true },
      { text: 'До 50 слайдов', ok: true },
      { text: 'Экспорт PPTX и PDF', ok: true },
      { text: 'Без водяного знака', ok: true },
      { text: 'Расширенные шаблоны', ok: true },
      { text: 'Брендбук + загрузка логотипа', ok: true },
      { text: 'Заметки спикера', ok: true },
    ],
    cta: 'Выбрать PRO',
    href: '/register?plan=pro',
  },
  {
    name: 'Business',
    desc: 'Для команд',
    price: '9 900',
    currency: '₽',
    period: '/мес',
    featured: false,
    badge: null,
    features: [
      { text: 'Безлимитные презентации', ok: true },
      { text: 'До 100 слайдов', ok: true },
      { text: 'Командные рабочие пространства', ok: true },
      { text: 'Единый брендбук', ok: true },
      { text: 'Роли пользователей', ok: true },
      { text: 'Индивидуальные шаблоны', ok: true },
      { text: 'API-доступ', ok: true },
    ],
    cta: 'Связаться с нами',
    href: '/register?plan=business',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="landing__hero">
        <Container narrow>
          <h1 className="landing__hero-title">
            <span className="landing__hero-title-accent">Загрузите</span> текст или Excel —<br />
            получите готовую <span className="landing__hero-title-accent">презентацию</span>
          </h1>
          <p className="landing__hero-subtitle">
            Сервис анализирует документ, выделяет структуру, строит графики, 
            формирует выводы и создаёт презентацию с экспортом в PPTX/PDF за несколько минут.
          </p>
          <div className="landing__hero-actions">
            <Link href="/register">
              <Button size="lg">Начать бесплатно</Button>
            </Link>
            <Link href="/login" className="landing__hero-link">
              У меня уже есть аккаунт
            </Link>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="landing__how">
        <Container>
          <h2 className="landing__section-title">Как это работает</h2>
          <div className="landing__steps">
            {steps.map((step) => (
              <div key={step.number} className="landing__step">
                <div className="landing__step-number">{step.number}</div>
                <h3 className="landing__step-title">{step.title}</h3>
                <p className="landing__step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Formats */}
      <section className="landing__formats">
        <Container>
          <h2 className="landing__section-title">Поддерживаемые форматы</h2>
          <div className="landing__formats-list">
            {['TXT', 'DOCX', 'XLSX', 'CSV', 'PDF'].map((fmt) => (
              <span key={fmt} className="landing__format-badge">{fmt}</span>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="landing__features">
        <Container>
          <h2 className="landing__section-title">Возможности сервиса</h2>
          <div className="landing__features-grid">
            {features.map((f, i) => (
              <Card key={i}>
                <div className="landing__feature">
                  <div className="landing__feature-icon">{f.icon}</div>
                  <h3 className="landing__feature-title">{f.title}</h3>
                  <p className="landing__feature-desc">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="landing__pricing">
        <Container>
          <h2 className="landing__section-title">Тарифы</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: -24, marginBottom: 8, fontSize: 15 }}>
            Выберите подходящий тариф. Все цены указаны с НДС.
          </p>
          <div className="landing__pricing-grid">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'landing__pricing-card',
                  plan.featured ? 'landing__pricing-card--featured' : '',
                ].filter(Boolean).join(' ')}
              >
                {plan.badge && (
                  <span className="landing__pricing-badge">{plan.badge}</span>
                )}
                <div className="landing__pricing-name">{plan.name}</div>
                <div className="landing__pricing-desc">{plan.desc}</div>

                <div className="landing__pricing-price">
                  <span className="landing__pricing-amount">{plan.price}</span>
                  <span className="landing__pricing-currency">{plan.currency}</span>
                  <span className="landing__pricing-period">{plan.period}</span>
                </div>

                <div className="landing__pricing-features">
                  {plan.features.map((f, i) => (
                    <span
                      key={i}
                      className={[
                        'landing__pricing-feature',
                        !f.ok ? 'landing__pricing-feature--missing' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {f.text}
                    </span>
                  ))}
                </div>

                <div className="landing__pricing-action">
                  <Link href={plan.href}>
                    <Button
                      variant={plan.featured ? 'primary' : 'secondary'}
                      full
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="landing__cta">
        <Container narrow>
          <h2 className="landing__cta-title">Готовы попробовать?</h2>
          <p className="landing__cta-subtitle">
            Создайте первую презентацию бесплатно — без карты, без обязательств.
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Создать презентацию
            </Button>
          </Link>
        </Container>
      </section>
    </div>
  );
}

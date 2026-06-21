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
              <Card key={i} hover>
                <div className="landing__feature-icon">{f.icon}</div>
                <h3 className="landing__feature-title">{f.title}</h3>
                <p className="landing__feature-desc">{f.desc}</p>
              </Card>
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

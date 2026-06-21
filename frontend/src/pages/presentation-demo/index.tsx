import { useState } from 'react';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import styles from './demo.module.css';

const slides = [
  { title: 'AI Presentation Builder', subtitle: 'Автоматическая генерация бизнес-презентаций из текстовых файлов и Excel', type: 'cover' },
  { title: 'Проблема', bullets: ['Подготовка презентации занимает 2–4 часа', 'Перенос данных из Excel в PowerPoint вручную', 'Не хватает дизайнерских навыков для красивых слайдов', 'Сложно быстро переделать структуру'] },
  { title: 'Решение', bullets: ['Загрузите файл — получите готовую презентацию', 'AI анализирует текст и Excel, строит графики', '8 шаблонов дизайна на любой вкус', 'Редактирование перед экспортом'] },
  { title: 'Как это работает', bullets: ['1. Загрузите TXT, DOCX или XLSX', '2. Выберите тип и стиль презентации', '3. AI генерирует структуру и слайды', '4. Скачайте PPTX или PDF'] },
  { title: 'Возможности', bullets: ['Работа с текстом — выделение тезисов и структуры', 'Excel-аналитика — графики, KPI, тренды', '8 типов презентаций под разные задачи', 'Встроенный редактор слайдов', 'Экспорт в PowerPoint и PDF'] },
  { title: 'Тарифы', bullets: ['Free — 1 презентация, PDF, водяной знак', 'Start — 990 ₽/мес, 20 презентаций, PPTX', 'PRO — 2 990 ₽/мес, 100 презентаций, брендбук', 'Business — 9 900 ₽/мес, безлимит, команда'] },
  { title: 'Клиенты и кейсы', bullets: ['Маркетологи — отчёты и медиапланы за минуты', 'Продажники — коммерческие предложения и pitch deck', 'Аналитики — отчёты с графиками и выводами', 'Стартапы — презентации для инвесторов'] },
  { title: 'Начните прямо сейчас', subtitle: 'Создайте первую презентацию бесплатно\nбез карты и регистрации', type: 'cta' },
];

export default function PresentationDemo() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  const goNext = () => setCurrent(s => Math.min(s + 1, slides.length - 1));
  const goPrev = () => setCurrent(s => Math.max(s - 1, 0));

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.header}>
        <Container>
          <div className={styles.headerInner}>
            <span className={styles.logo}>AI Presentation Builder</span>
            <div className={styles.controls}>
              <Button href="/register" variant="primary" size="s">Создать свою</Button>
            </div>
          </div>
        </Container>
      </header>

      <main className={styles.main}>
        <Container>
          {/* Slide preview */}
          <div className={styles.slideArea}>
            {slide.type === 'cover' ? (
              <div className={styles.coverSlide}>
                <div className={styles.watermark}>DEMO</div>
                <h1 className={styles.coverTitle}>{slide.title}</h1>
                <p className={styles.coverSub}>{slide.subtitle}</p>
              </div>
            ) : slide.type === 'cta' ? (
              <div className={styles.ctaSlide}>
                <div className={styles.watermark}>DEMO</div>
                <h2 className={styles.ctaTitle}>{slide.title}</h2>
                <p className={styles.ctaText}>{slide.subtitle}</p>
                <Button href="/create" variant="primary" size="l">Создать презентацию</Button>
              </div>
            ) : (
              <div className={styles.contentSlide}>
                <div className={styles.watermark}>DEMO</div>
                <h2 className={styles.slideTitle}>{slide.title}</h2>
                <ul className={styles.bullets}>
                  {slide.bullets?.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={styles.nav}>
            <button onClick={goPrev} disabled={current === 0} className={styles.navBtn}>
              ← Назад
            </button>
            <div className={styles.pageIndicator}>
              {current + 1} / {slides.length}
            </div>
            <button onClick={goNext} disabled={current === slides.length - 1} className={styles.navBtn}>
              Вперед →
            </button>
          </div>

          {/* Thumbnails */}
          <div className={styles.thumbnails}>
            {slides.map((s, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`}
                onClick={() => setCurrent(i)}
              >
                <span className={styles.thumbNum}>{i + 1}</span>
                <span className={styles.thumbTitle}>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Blocked export */}
          <div className={styles.blockedExport}>
            <p>⚡ Экспорт в PPTX и PDF доступен после регистрации</p>
            <Button href="/register" variant="primary">Зарегистрироваться</Button>
          </div>
        </Container>
      </main>
    </div>
  );
}

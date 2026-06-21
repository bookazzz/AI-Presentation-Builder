'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button/Button';
import './presentation-demo.css';

const slides = [
  {
    type: 'cover',
    title: 'Отчёт по продажам',
    subtitle: 'Итоги и ключевые выводы · 2026 год',
    bullets: [],
    chart: null,
    kpi: null,
  },
  {
    type: 'content',
    title: 'Ключевые показатели',
    bullets: [
      'Общая выручка за период: 12,4 млн ₽',
      'Рост относительно прошлого года: +18%',
      'Количество новых клиентов: 246',
      'Средний чек: 50 400 ₽',
    ],
    chart: null,
    kpi: { items: [
      { value: '12,4 млн', label: 'Выручка' },
      { value: '+18%', label: 'Рост' },
      { value: '246', label: 'Клиенты' },
    ]},
  },
  {
    type: 'content',
    title: 'Динамика продаж по месяцам',
    bullets: [
      'Максимальный объём — декабрь (1,8 млн ₽)',
      'Минимальный — январь (0,7 млн ₽)',
      'Стабильный рост с марта по ноябрь',
      'Сезонный спад в январе-феврале',
    ],
    chart: 'Линейный график: продажи по месяцам',
    kpi: null,
  },
  {
    type: 'content',
    title: 'Структура выручки по продуктам',
    bullets: [
      'Продукт A — 42% (5,2 млн ₽)',
      'Продукт B — 31% (3,8 млн ₽)',
      'Продукт C — 18% (2,2 млн ₽)',
      'Прочие — 9% (1,2 млн ₽)',
    ],
    chart: 'Круговая диаграмма: доля продуктов в выручке',
    kpi: null,
  },
  {
    type: 'content',
    title: 'Топ-5 клиентов по объёму закупок',
    bullets: [
      'ООО «ТехноПром» — 1,2 млн ₽',
      'АО «СтройИнвест» — 0,9 млн ₽',
      'ИП Петров А.В. — 0,7 млн ₽',
      'ООО «МаркетГрупп» — 0,6 млн ₽',
      'ЗАО «ЛогистикЦентр» — 0,5 млн ₽',
    ],
    chart: null,
    kpi: null,
  },
  {
    type: 'content',
    title: 'Сравнение периодов: 2025 vs 2026',
    bullets: [
      'Выручка: +18% (10,5 млн → 12,4 млн)',
      'Количество сделок: +12%',
      'Средний чек: +5%',
      'Конверсия из лида: 24% → 28%',
    ],
    chart: 'Столбчатая диаграмма: сравнение 2025 и 2026',
    kpi: null,
  },
  {
    type: 'content',
    title: 'Ключевые выводы',
    bullets: [
      'Компания показывает уверенный рост второй год подряд',
      'Продукт A остаётся основным драйвером выручки',
      'Необходимо усилить направление в январе-феврале',
      'Рекомендуется расширение продуктовой линейки B',
    ],
    chart: null,
    kpi: null,
  },
  {
    type: 'content',
    title: 'Следующие шаги',
    bullets: [
      'Утвердить план продаж на следующий квартал',
      'Запустить акцию для удержания топ-клиентов',
      'Оптимизировать воронку в январе',
      'Подготовить отчёт по каждому продукту',
    ],
    chart: null,
    kpi: null,
  },
];

export default function PresentationDemoPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const current = slides[activeSlide];

  return (
    <div className="presentation-demo">
      {/* Header */}
      <div className="presentation-demo__header">
        <Link href="/create" className="presentation-demo__back">
          ← Назад к созданию
        </Link>
        <div className="presentation-demo__header-title">
          Отчёт по продажам за 2026 год
          <span style={{ marginLeft: 10, fontSize: 11, color: '#a6adc8', fontWeight: 400 }}>
            ({activeSlide + 1} / {slides.length})
          </span>
          <span className="presentation-demo__free-badge" style={{ marginLeft: 10 }}>
            Free
          </span>
        </div>
        <div className="presentation-demo__header-actions">
          <Button variant="ghost" size="sm" disabled>
            PPTX
          </Button>
          <Button variant="ghost" size="sm" disabled>
            PDF
          </Button>
        </div>
      </div>

      <div className="presentation-demo__layout">
        {/* Thumbnails */}
        <div className="presentation-demo__thumbs">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={[
                'presentation-demo__thumb',
                i === activeSlide ? 'presentation-demo__thumb--active' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setActiveSlide(i)}
            >
              <div className="presentation-demo__thumb-number">
                Слайд {i + 1}
              </div>
              <div className="presentation-demo__thumb-title">
                {slide.title}
              </div>
            </div>
          ))}
        </div>

        {/* Slide preview */}
        <div className="presentation-demo__slide-area">
          <div className={`presentation-demo__slide ${current.type === 'cover' ? 'presentation-demo__slide--cover' : ''}`}>
            {/* Watermark */}
            <div className="presentation-demo__watermark">
              AI Presentation Builder — Бесплатная версия
            </div>

            {current.type === 'cover' ? (
              <>
                <h1 className="presentation-demo__slide-title">{current.title}</h1>
                <p className="presentation-demo__slide-subtitle">{current.subtitle}</p>
              </>
            ) : (
              <>
                <h2 className="presentation-demo__slide-title">{current.title}</h2>
                <div className="presentation-demo__slide-content">
                  {current.bullets.map((b, i) => (
                    <div key={i} className="presentation-demo__slide-bullet">{b}</div>
                  ))}

                  {current.kpi && (
                    <div className="presentation-demo__slide-kpi">
                      {current.kpi.items.map((k, i) => (
                        <div key={i} className="presentation-demo__kpi-card">
                          <div className="presentation-demo__kpi-value">{k.value}</div>
                          <div className="presentation-demo__kpi-label">{k.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {current.chart && (
                    <div className="presentation-demo__slide-chart">
                      📊 {current.chart}
                    </div>
                  )}
                </div>
                <div className="presentation-demo__slide-footer">
                  Создано в AI Presentation Builder · Бесплатная версия
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

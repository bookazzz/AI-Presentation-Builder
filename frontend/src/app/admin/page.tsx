'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button/Button';
import './page.css';

type Section = 'users' | 'presentations' | 'plans' | 'templates' | 'logs';

const sections: { id: Section; label: string; icon: string }[] = [
  { id: 'users', label: 'Пользователи', icon: '👥' },
  { id: 'presentations', label: 'Презентации', icon: '📊' },
  { id: 'plans', label: 'Тарифы', icon: '💳' },
  { id: 'templates', label: 'Шаблоны', icon: '🎨' },
  { id: 'logs', label: 'Логи', icon: '📋' },
];

// ---------- Mock data ----------

const mockUsers = [
  { id: 1, email: 'ivanov@company.ru', name: 'Иванов Иван', plan: 'start', presentations: 12, registered: '2025-12-01', lastLogin: '2026-06-20', status: 'active' },
  { id: 2, email: 'petrova@mail.ru', name: 'Петрова Анна', plan: 'pro', presentations: 45, registered: '2026-01-15', lastLogin: '2026-06-21', status: 'active' },
  { id: 3, email: 'sidorov@yandex.ru', name: 'Сидоров Пётр', plan: 'free', presentations: 1, registered: '2026-06-18', lastLogin: '2026-06-18', status: 'active' },
  { id: 4, email: 'kuznetsova@gmail.com', name: 'Кузнецова Елена', plan: 'business', presentations: 180, registered: '2025-10-20', lastLogin: '2026-06-21', status: 'active' },
  { id: 5, email: 'popov@bk.ru', name: 'Попов Алексей', plan: 'start', presentations: 7, registered: '2026-03-05', lastLogin: '2026-06-10', status: 'blocked' },
  { id: 6, email: 'smirnov@skbkontur.ru', name: 'Смирнов Дмитрий', plan: 'pro', presentations: 88, registered: '2025-11-10', lastLogin: '2026-06-19', status: 'active' },
  { id: 7, email: 'fedotova@inbox.ru', name: 'Федотова Ольга', plan: 'free', presentations: 0, registered: '2026-06-21', lastLogin: '2026-06-21', status: 'active' },
  { id: 8, email: 'mikhailov@partner.com', name: 'Михайлов Сергей', plan: 'business', presentations: 210, registered: '2025-08-01', lastLogin: '2026-06-20', status: 'active' },
];

const mockPresentations = [
  { id: 101, user: 'Иванов Иван', title: 'Отчёт по продажам Q1 2026', type: 'report', slides: 12, status: 'completed', created: '2026-06-20 14:30' },
  { id: 102, user: 'Петрова Анна', title: 'Pitch Deck — AI Analytics', type: 'pitch', slides: 10, status: 'completed', created: '2026-06-20 11:15' },
  { id: 103, user: 'Попов Алексей', title: 'Коммерческое предложение — Контур', type: 'proposal', slides: 8, status: 'error', created: '2026-06-19 16:45' },
  { id: 104, user: 'Смирнов Дмитрий', title: 'Анализ рынка CRM 2026', type: 'report', slides: 18, status: 'completed', created: '2026-06-19 09:20' },
  { id: 105, user: 'Кузнецова Елена', title: 'Стратегия продвижения 2027', type: 'business', slides: 15, status: 'pending', created: '2026-06-21 08:00' },
  { id: 106, user: 'Иванов Иван', title: 'Обучение сотрудников — новый CRM', type: 'education', slides: 22, status: 'completed', created: '2026-06-18 17:30' },
  { id: 107, user: 'Михайлов Сергей', title: 'Годовой отчёт перед инвесторами', type: 'pitch', slides: 25, status: 'completed', created: '2026-06-17 12:00' },
  { id: 108, user: 'Петрова Анна', title: 'Медиаплан на июль 2026', type: 'business', slides: 9, status: 'completed', created: '2026-06-16 10:45' },
  { id: 109, user: 'Сидоров Пётр', title: 'Презентация продукта', type: 'product', slides: 7, status: 'error', created: '2026-06-15 20:10' },
  { id: 110, user: 'Федотова Ольга', title: 'Первая презентация', type: 'business', slides: 6, status: 'pending', created: '2026-06-21 09:30' },
];

const mockPlans = [
  { name: 'Free', price: '0 ₽', presentations: 1, slides: 8, pptx: false, pdf: true, watermark: true, branding: false, excel: false, speakerNotes: false },
  { name: 'Start', price: '990 ₽/мес', presentations: 20, slides: 25, pptx: true, pdf: true, watermark: false, branding: false, excel: true, speakerNotes: false },
  { name: 'PRO', price: '2 990 ₽/мес', presentations: 100, slides: 50, pptx: true, pdf: true, watermark: false, branding: true, excel: true, speakerNotes: true },
  { name: 'Business', price: '9 900 ₽/мес', presentations: '∞', slides: 100, pptx: true, pdf: true, watermark: false, branding: true, excel: true, speakerNotes: true },
];

const mockTemplates = [
  { name: 'Деловой минималистичный', type: 'business', preview: '📄' },
  { name: 'Тёмный инвестиционный', type: 'pitch', preview: '🌑' },
  { name: 'Светлый корпоративный', type: 'business', preview: '🏢' },
  { name: 'Маркетинговый яркий', type: 'marketing', preview: '🚀' },
  { name: 'Аналитический отчёт', type: 'report', preview: '📊' },
  { name: 'Образовательный', type: 'education', preview: '🎓' },
  { name: 'Коммерческое предложение', type: 'proposal', preview: '💼' },
  { name: 'Pitch Deck', type: 'pitch', preview: '📈' },
  { name: 'Продуктовая презентация', type: 'product', preview: '📱' },
  { name: 'Отчёт по Excel', type: 'report', preview: '📑' },
];

const mockLogs = [
  { time: '2026-06-21 09:15:23', level: 'info', msg: 'Генерация презентации #105: структура создана' },
  { time: '2026-06-21 08:42:10', level: 'error', msg: 'LLM ошибка при генерации слайда #103: превышен лимит токенов' },
  { time: '2026-06-21 08:30:55', level: 'info', msg: 'Пользователь fedotova@inbox.ru зарегистрирован' },
  { time: '2026-06-21 08:15:00', level: 'warn', msg: 'Экспорт PDF #107: шрифт не найден, использован запасной' },
  { time: '2026-06-21 07:58:12', level: 'info', msg: 'Платеж #9023: PRO тариф, 2 990 ₽, пользователь smirnov@skbkontur.ru' },
  { time: '2026-06-20 23:11:44', level: 'error', msg: 'Парсинг XLSX: неверный формат листа (пользователь popov@bk.ru)' },
  { time: '2026-06-20 22:00:01', level: 'info', msg: 'Ежедневный отчёт: 23 презентации, 5 ошибок, 12 новых пользователей' },
  { time: '2026-06-20 18:30:20', level: 'warn', msg: 'Пользователь sidorov@yandex.ru превысил лимит Free тарифа' },
  { time: '2026-06-20 15:10:33', level: 'info', msg: 'Экспорт PPTX #104 завершён успешно' },
  { time: '2026-06-20 14:25:47', level: 'error', msg: 'Celery task timeout: генерация #108 (превышено 120 сек)' },
  { time: '2026-06-20 12:00:15', level: 'info', msg: 'Бэкап базы данных выполнен (размер 1.2 ГБ)' },
  { time: '2026-06-20 10:05:00', level: 'warn', msg: 'Selectel Object Storage: 85% заполнения, требуется расширение' },
];

// ---------- Component ----------

export default function AdminPage() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('users');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setChecked(true));
  }, [checkAuth]);

  if (!checked) {
    return (
      <div className="admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const isAdmin = isAuthenticated && (user as any)?.role === 'admin';

  // Allow pseudo-admin in static mode (demo)
  const pseudoAdmin = typeof window !== 'undefined' && localStorage.getItem('admin_mode') === 'true';

  if (!isAdmin && !pseudoAdmin) {
    return (
      <div className="admin">
        <div className="admin__denied">
          <div className="admin__denied-icon">🔒</div>
          <h1 className="admin__denied-title">Доступ запрещён</h1>
          <p className="admin__denied-text">
            Эта страница доступна только администраторам. Войдите в аккаунт с правами администратора.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Link href="/">
              <Button>На главную</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                localStorage.setItem('admin_mode', 'true');
                window.location.reload();
              }}
            >
              🛠️ Демо-режим
            </Button>
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>
            Демо-режим показывает интерфейс админки с тестовыми данными.
          </p>
        </div>
      </div>
    );
  }

  // Demo hint
  const showHint = pseudoAdmin && !isAdmin;

  return (
    <div className="admin">
      {showHint && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#fff7e6', color: '#8d6e00', padding: '8px 16px', borderRadius: 8,
          fontSize: 13, zIndex: 200, border: '1px solid #ffe58f'
        }}>
          🛠️ Демо-режим админки. В боевом режиме доступ только для администратора.
        </div>
      )}

      <aside className="admin__sidebar">
        <div className="admin__sidebar-title">Администрирование</div>
        <nav className="admin__nav">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`admin__nav-item ${activeSection === s.id ? 'admin__nav-item--active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="admin__nav-icon">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin__content">
        {/* ---------- Overview Cards (always shown) ---------- */}
        {activeSection !== 'plans' && (
          <div className="admin__overview">
            <div className="admin__stat-card">
              <div className="admin__stat-label">Пользователи</div>
              <div className="admin__stat-value">{mockUsers.length}</div>
              <div className="admin__stat-delta admin__stat-delta--up">+3 за неделю</div>
            </div>
            <div className="admin__stat-card">
              <div className="admin__stat-label">Всего презентаций</div>
              <div className="admin__stat-value">128</div>
              <div className="admin__stat-delta admin__stat-delta--up">+18 за сегодня</div>
            </div>
            <div className="admin__stat-card">
              <div className="admin__stat-label">Выручка (мес)</div>
              <div className="admin__stat-value">248 000 ₽</div>
              <div className="admin__stat-delta admin__stat-delta--up">+12% к прошлому</div>
            </div>
            <div className="admin__stat-card">
              <div className="admin__stat-label">Затраты на LLM</div>
              <div className="admin__stat-value">42 500 ₽</div>
              <div className="admin__stat-delta admin__stat-delta--down">-8% к прошлому</div>
            </div>
          </div>
        )}

        {/* ---------- Users ---------- */}
        {activeSection === 'users' && (
          <>
            <div className="admin__section-header">
              <h2 className="admin__section-title">Пользователи</h2>
              <Button size="sm">+ Добавить</Button>
            </div>
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Имя</th>
                    <th>Тариф</th>
                    <th>Презентации</th>
                    <th>Регистрация</th>
                    <th>Последний вход</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.name}</td>
                      <td>
                        <span className={`admin__badge admin__badge--${u.plan}`}>
                          {u.plan === 'free' ? 'Free' : u.plan === 'start' ? 'Start' : u.plan === 'pro' ? 'PRO' : 'Business'}
                        </span>
                      </td>
                      <td>{u.presentations}</td>
                      <td>{u.registered}</td>
                      <td>{u.lastLogin}</td>
                      <td>
                        <span className={`admin__badge admin__badge--${u.status}`}>
                          {u.status === 'active' ? 'Активен' : 'Заблокирован'}
                        </span>
                      </td>
                      <td>
                        <div className="admin__actions-group">
                          <button className="admin__action-btn">✏️</button>
                          <button className="admin__action-btn admin__action-btn--danger">
                            {u.status === 'active' ? '🚫' : '✅'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ---------- Presentations ---------- */}
        {activeSection === 'presentations' && (
          <>
            <div className="admin__section-header">
              <h2 className="admin__section-title">Презентации</h2>
              <div className="admin__section-actions">
                <Button size="sm">Экспорт CSV</Button>
              </div>
            </div>
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Пользователь</th>
                    <th>Тип</th>
                    <th>Слайды</th>
                    <th>Статус</th>
                    <th>Создана</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPresentations.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13 }}>#{p.id}</td>
                      <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                      <td>{p.user}</td>
                      <td>
                        <span className="admin__badge" style={{
                          background: p.type === 'pitch' ? '#ede7f6' : p.type === 'report' ? '#e3f2fd' : p.type === 'proposal' ? '#e8f5e9' : p.type === 'education' ? '#fce4ec' : '#f5f5f5',
                          color: p.type === 'pitch' ? '#5e35b1' : p.type === 'report' ? '#1565c0' : p.type === 'proposal' ? '#2e7d32' : p.type === 'education' ? '#c62828' : '#666',
                        }}>
                          {p.type === 'business' ? 'Бизнес' : p.type === 'report' ? 'Отчёт' : p.type === 'pitch' ? 'Pitch Deck' : p.type === 'proposal' ? 'КП' : p.type === 'education' ? 'Обучение' : p.type === 'product' ? 'Продукт' : p.type}
                        </span>
                      </td>
                      <td>{p.slides}</td>
                      <td>
                        <span className={`admin__badge admin__badge--${p.status === 'completed' ? 'completed' : p.status === 'error' ? 'error' : 'pending'}`}>
                          {p.status === 'completed' ? 'Готово' : p.status === 'error' ? 'Ошибка' : 'В обработке'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{p.created}</td>
                      <td>
                        <div className="admin__actions-group">
                          <button className="admin__action-btn" title="Просмотр">👁️</button>
                          <button className="admin__action-btn admin__action-btn--danger" title="Удалить">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ---------- Plans ---------- */}
        {activeSection === 'plans' && (
          <>
            <div className="admin__section-header">
              <h2 className="admin__section-title">Тарифы</h2>
              <Button size="sm">Создать тариф</Button>
            </div>
            <div className="admin__plans-grid">
              {mockPlans.map((pl) => (
                <div key={pl.name} className="admin__plan-card">
                  <div className="admin__plan-name">{pl.name}</div>
                  <div className="admin__plan-price">{pl.price}</div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">Презентаций</span>
                    <span className="admin__plan-field-value">{pl.presentations}</span>
                  </div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">Слайдов</span>
                    <span className="admin__plan-field-value">{pl.slides}</span>
                  </div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">PPTX экспорт</span>
                    <span className="admin__plan-field-value">{pl.pptx ? '✅' : '❌'}</span>
                  </div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">PDF экспорт</span>
                    <span className="admin__plan-field-value">{pl.pdf ? '✅' : '❌'}</span>
                  </div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">Водяной знак</span>
                    <span className="admin__plan-field-value">{pl.watermark ? '✅' : '❌'}</span>
                  </div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">Брендбук</span>
                    <span className="admin__plan-field-value">{pl.branding ? '✅' : '❌'}</span>
                  </div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">Excel</span>
                    <span className="admin__plan-field-value">{pl.excel ? '✅' : '❌'}</span>
                  </div>
                  <div className="admin__plan-field">
                    <span className="admin__plan-field-label">Заметки спикера</span>
                    <span className="admin__plan-field-value">{pl.speakerNotes ? '✅' : '❌'}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- Templates ---------- */}
        {activeSection === 'templates' && (
          <>
            <div className="admin__section-header">
              <h2 className="admin__section-title">Шаблоны оформления</h2>
              <Button size="sm">+ Загрузить шаблон</Button>
            </div>
            <div className="admin__templates-grid">
              {mockTemplates.map((t) => (
                <div key={t.name} className="admin__template-card">
                  <div className="admin__template-preview">{t.preview}</div>
                  <div className="admin__template-name">{t.name}</div>
                  <div className="admin__template-type">
                    {t.type === 'business' ? 'Бизнес' : t.type === 'pitch' ? 'Pitch Deck' : t.type === 'marketing' ? 'Маркетинг' : t.type === 'report' ? 'Отчёт' : t.type === 'education' ? 'Образование' : t.type === 'proposal' ? 'КП' : t.type === 'product' ? 'Продукт' : t.type}
                  </div>
                  <div className="admin__actions-group" style={{ justifyContent: 'center' }}>
                    <button className="admin__action-btn">✏️ Ред.</button>
                    <button className="admin__action-btn admin__action-btn--danger">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- Logs ---------- */}
        {activeSection === 'logs' && (
          <>
            <div className="admin__section-header">
              <h2 className="admin__section-title">Логи системы</h2>
              <div className="admin__section-actions">
                <Button size="sm">Очистить</Button>
              </div>
            </div>
            <div className="admin__table-wrap">
              <div style={{ padding: '0 16px' }}>
                {mockLogs.map((log, i) => (
                  <div key={i} className="admin__log-item">
                    <span className="admin__log-time">{log.time}</span>
                    <span className={`admin__log-level admin__log-level--${log.level}`}>
                      {log.level}
                    </span>
                    <span className="admin__log-msg">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

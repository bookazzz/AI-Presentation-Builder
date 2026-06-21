'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const presentationTypes = [
  { id: 'business', label: 'Бизнес-презентация' },
  { id: 'commercial', label: 'Коммерческое предложение' },
  { id: 'pitch_deck', label: 'Pitch Deck' },
  { id: 'report', label: 'Отчёт' },
  { id: 'educational', label: 'Обучающая презентация' },
  { id: 'product', label: 'Презентация продукта' },
  { id: 'excel', label: 'По Excel-данным' },
  { id: 'free', label: 'Свободный формат' },
];

const styles = [
  { id: 'business', label: 'Деловой' },
  { id: 'minimal', label: 'Минималистичный' },
  { id: 'modern', label: 'Современный' },
  { id: 'investment', label: 'Инвестиционный' },
  { id: 'corporate', label: 'Корпоративный' },
  { id: 'marketing', label: 'Яркий маркетинговый' },
  { id: 'analytical', label: 'Строгий аналитический' },
  { id: 'educational', label: 'Образовательный' },
];

const targetAudiences = [
  { id: 'client', label: 'Клиент' },
  { id: 'investor', label: 'Инвестор' },
  { id: 'manager', label: 'Руководитель' },
  { id: 'team', label: 'Команда' },
  { id: 'students', label: 'Ученики/студенты' },
  { id: 'partners', label: 'Партнёры' },
  { id: 'general', label: 'Широкая аудитория' },
];

export default function CreatePresentationPage() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [type, setType] = useState('business');
  const [audience, setAudience] = useState('client');
  const [style, setStyle] = useState('business');
  const [slidesCount, setSlidesCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Введите текст или загрузите файл');
      return;
    }
    setLoading(true);
    toast.success('Презентация создаётся...');
    // TODO: API call
    setLoading(false);
  };

  return (
    <div className="flex-1">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            &larr; Назад
          </Link>
          <h1 className="text-xl font-bold">Создать презентацию</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Название презентации</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Отчёт по продажам за 2026 год"
            />
          </div>

          {/* Text input */}
          <div>
            <label className="block text-sm font-medium mb-1">Исходный текст</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 h-48"
              placeholder="Вставьте текст или загрузите файл..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Поддерживается до 100 000 символов. Также можно загрузить TXT, DOCX, XLSX, CSV или PDF.
            </p>
          </div>

          {/* File upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Перетащите файл сюда или нажмите для выбора</p>
            <p className="text-xs text-gray-400 mt-1">TXT, DOCX, XLSX, CSV, PDF до 20 МБ</p>
          </div>

          {/* Type + Audience + Style */}
          <div className="grid md:grid-cols-3 gap-6">
            <fieldset>
              <legend className="text-sm font-medium mb-2">Тип презентации</legend>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {presentationTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium mb-2">Аудитория</legend>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {targetAudiences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium mb-2">Стиль оформления</legend>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>

          {/* Slides count */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Количество слайдов: {slidesCount}
            </label>
            <input
              type="range"
              min={5}
              max={25}
              value={slidesCount}
              onChange={(e) => setSlidesCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>5</span>
              <span>25</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Создаём презентацию...' : 'Создать презентацию'}
          </button>
        </form>
      </main>
    </div>
  );
}

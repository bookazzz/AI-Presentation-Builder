'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/Container/Container';
import Input from '@/components/Input/Input';
import TextArea from '@/components/TextArea/TextArea';
import Select from '@/components/Select/Select';
import Button from '@/components/Button/Button';
import FileUpload from '@/components/FileUpload/FileUpload';
import StepIndicator from '@/components/StepIndicator/StepIndicator';
import toast from 'react-hot-toast';
import './create.css';

const STEPS = [
  { id: 1, label: 'Данные' },
  { id: 2, label: 'Настройки' },
  { id: 3, label: 'Структура' },
  { id: 4, label: 'Готово' },
];

const presentationTypes = [
  { value: 'business', label: 'Бизнес-презентация' },
  { value: 'commercial', label: 'Коммерческое предложение' },
  { value: 'pitch_deck', label: 'Pitch Deck' },
  { value: 'report', label: 'Отчёт' },
  { value: 'educational', label: 'Обучающая презентация' },
  { value: 'product', label: 'Презентация продукта' },
  { value: 'excel', label: 'По Excel-данным' },
  { value: 'free', label: 'Свободный формат' },
];

const styles = [
  { value: 'business', label: 'Деловой' },
  { value: 'minimal', label: 'Минималистичный' },
  { value: 'modern', label: 'Современный' },
  { value: 'investment', label: 'Инвестиционный' },
  { value: 'corporate', label: 'Корпоративный' },
  { value: 'marketing', label: 'Яркий маркетинговый' },
  { value: 'analytical', label: 'Строгий аналитический' },
  { value: 'educational', label: 'Образовательный' },
];

const targetAudiences = [
  { value: 'client', label: 'Клиент' },
  { value: 'investor', label: 'Инвестор' },
  { value: 'manager', label: 'Руководитель' },
  { value: 'team', label: 'Команда' },
  { value: 'students', label: 'Ученики / студенты' },
  { value: 'partners', label: 'Партнёры' },
  { value: 'general', label: 'Широкая аудитория' },
];

export default function CreatePresentationPage() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('business');
  const [audience, setAudience] = useState('client');
  const [style, setStyle] = useState('business');
  const [slidesCount, setSlidesCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const hasData = text.trim().length > 0 || file !== null;
    if (!hasData) {
      toast.error('Введите текст или загрузите файл');
      return;
    }
    setLoading(true);
    toast.success('Начинаем генерацию...');
    // TODO: API call
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="create-page">
      <div className="create-page__header">
        <Container>
          <div className="create-page__header-inner">
            <Link href="/dashboard" className="create-page__back">
              ← Назад
            </Link>
            <h1 className="create-page__title">Создать презентацию</h1>
          </div>
        </Container>
      </div>

      <div className="create-page__content">
        <Container narrow>
          <StepIndicator steps={STEPS} currentStep={step} />

          {step === 1 && (
            <div className="create-page__form">
              <div className="create-page__section">
                <h2 className="create-page__section-title">1. Название презентации</h2>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Отчёт по продажам за 2026 год"
                />
              </div>

              <div className="create-page__section">
                <h2 className="create-page__section-title">2. Исходные данные</h2>
                <TextArea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Вставьте текст для презентации..."
                  hint="Или загрузите файл ниже"
                  maxLength={100000}
                  currentLength={text.length}
                  rows={10}
                />
              </div>

              <div className="create-page__section">
                <h2 className="create-page__section-title">3. Или загрузите файл</h2>
                <FileUpload onFileSelect={setFile} />
              </div>

              <Button full size="lg" onClick={() => setStep(2)}>
                Далее — настройки
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="create-page__form">
              <div className="create-page__section">
                <h2 className="create-page__section-title">Настройки презентации</h2>
                <div className="create-page__grid">
                  <Select
                    label="Тип презентации"
                    options={presentationTypes}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  />
                  <Select
                    label="Аудитория"
                    options={targetAudiences}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                  <Select
                    label="Стиль оформления"
                    options={styles}
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  />
                </div>
              </div>

              <div className="create-page__section">
                <h2 className="create-page__section-title">Количество слайдов</h2>
                <div className="create-page__slider">
                  <div className="create-page__slider-value">{slidesCount}</div>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    value={slidesCount}
                    onChange={(e) => setSlidesCount(Number(e.target.value))}
                    className="create-page__slider-input"
                  />
                  <div className="create-page__slider-labels">
                    <span>5</span>
                    <span>25</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                  ← Назад
                </Button>
                <Button full size="lg" onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Генерируем...' : 'Создать презентацию'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="create-page__form">
              <p>Здесь будет структура презентации (outline)</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="secondary" onClick={() => setStep(2)}>← Назад</Button>
                <Button onClick={() => setStep(4)}>Подтвердить и создать</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="create-page__form">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Презентация создана!</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                  Вы можете отредактировать её или сразу скачать
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Button>Открыть редактор</Button>
                  <Button variant="secondary">Скачать PPTX</Button>
                  <Button variant="ghost">Скачать PDF</Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

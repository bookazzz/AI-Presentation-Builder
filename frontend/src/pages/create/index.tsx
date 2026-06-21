import { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import Input from '@/components/Input/Input';
import Select from '@/components/Select/Select';
import TextArea from '@/components/TextArea/TextArea';
import FileUpload from '@/components/FileUpload/FileUpload';
import StepIndicator from '@/components/StepIndicator/StepIndicator';
import styles from './create.module.css';

const steps = ['Загрузка', 'Настройки', 'Структура', 'Результат'];

const presentationTypes = [
  { value: 'business', label: 'Бизнес-презентация' },
  { value: 'commercial', label: 'Коммерческое предложение' },
  { value: 'pitch', label: 'Pitch Deck' },
  { value: 'report', label: 'Отчёт' },
  { value: 'educational', label: 'Обучающая презентация' },
  { value: 'product', label: 'Презентация продукта' },
  { value: 'excel', label: 'По Excel-данным' },
  { value: 'free', label: 'Свободный формат' },
];

const audiences = [
  { value: 'client', label: 'Клиент' },
  { value: 'investor', label: 'Инвестор' },
  { value: 'manager', label: 'Руководитель' },
  { value: 'team', label: 'Команда' },
  { value: 'students', label: 'Ученики / Студенты' },
  { value: 'partner', label: 'Партнёры' },
  { value: 'general', label: 'Широкая аудитория' },
];

const styles_options = [
  { value: 'business', label: 'Деловой' },
  { value: 'minimal', label: 'Минималистичный' },
  { value: 'modern', label: 'Современный' },
  { value: 'investment', label: 'Инвестиционный' },
  { value: 'corporate', label: 'Корпоративный' },
  { value: 'marketing', label: 'Яркий маркетинговый' },
  { value: 'analytical', label: 'Строгий аналитический' },
  { value: 'educational', label: 'Образовательный' },
];

export default function CreatePresentation() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('business');
  const [audience, setAudience] = useState('client');
  const [style, setStyle] = useState('business');
  const [slidesCount, setSlidesCount] = useState('10');
  const [language, setLanguage] = useState('ru');

  const handleFileSelect = (f: File) => {
    setFile(f);
    setStep(2);
  };

  const handleNext = () => {
    if (step === 1 && !file && !text.trim()) return;
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleGenerate = () => {
    // В будущем — API-запрос
    setStep(4);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Container>
          <h1 className={styles.title}>Создание презентации</h1>
          <StepIndicator steps={steps} currentStep={step} className={styles.steps} />

          <Card className={styles.content}>
            {/* Step 1: Upload */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Загрузите файл или вставьте текст</h2>
                <div className={styles.uploadArea}>
                  <FileUpload
                    accept=".txt,.docx,.xlsx,.csv,.pdf"
                    maxSize={20}
                    onFileSelect={handleFileSelect}
                    label="Перетащите файл сюда или кликните для выбора"
                    hint="TXT, DOCX, XLSX, CSV, PDF — до 20 МБ"
                  />
                </div>
                <div className={styles.divider}>
                  <span>или</span>
                </div>
                <div className={styles.textInputArea}>
                  <Input
                    label="Название презентации"
                    placeholder="Отчёт по продажам за 2026 год"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <TextArea
                    label="Вставьте текст"
                    placeholder="Вставьте текст вашего документа, отчёта или описания..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Настройте презентацию</h2>
                <div className={styles.settingsGrid}>
                  <Select
                    label="Тип презентации"
                    options={presentationTypes}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  />
                  <Select
                    label="Аудитория"
                    options={audiences}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                  <Select
                    label="Стиль оформления"
                    options={styles_options}
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  />
                  <Select
                    label="Язык"
                    options={[{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }]}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                  <Input
                    label="Количество слайдов"
                    type="number"
                    min={5}
                    max={50}
                    value={slidesCount}
                    onChange={(e) => setSlidesCount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Structure (mock) */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Структура презентации</h2>
                <p className={styles.stepDesc}>
                  Проверьте и отредактируйте структуру перед генерацией
                </p>
                <div className={styles.outline}>
                  <div className={styles.outlineSlide}>
                    <span className={styles.outlineNum}>1</span>
                    <div>
                      <strong>Титульный слайд</strong>
                      <p>{title || 'Название презентации'}</p>
                    </div>
                  </div>
                  <div className={styles.outlineSlide}>
                    <span className={styles.outlineNum}>2</span>
                    <div>
                      <strong>Введение / Контекст</strong>
                      <p>Краткий обзор темы и целей презентации</p>
                    </div>
                  </div>
                  <div className={styles.outlineSlide}>
                    <span className={styles.outlineNum}>3–5</span>
                    <div>
                      <strong>Основная часть</strong>
                      <p>Ключевые тезисы, данные, аргументы</p>
                    </div>
                  </div>
                  <div className={styles.outlineSlide}>
                    <span className={styles.outlineNum}>{slidesCount - 1}</span>
                    <div>
                      <strong>Выводы</strong>
                      <p>Краткие итоги и ключевые результаты</p>
                    </div>
                  </div>
                  <div className={styles.outlineSlide}>
                    <span className={styles.outlineNum}>{slidesCount}</span>
                    <div>
                      <strong>Финальный слайд / CTA</strong>
                      <p>Следующий шаг, контакты, призыв к действию</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Result (mock) */}
            {step === 4 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Презентация готова!</h2>
                <div className={styles.resultIcon}>🎉</div>
                <p className={styles.resultText}>
                  Презентация «{title || 'Новая презентация'}» создана и сохранена в вашем кабинете.
                </p>
                <div className={styles.resultActions}>
                  <Button href="/dashboard" variant="primary">
                    Перейти к презентациям
                  </Button>
                  <Button variant="outline">
                    Скачать PPTX
                  </Button>
                  <Button variant="outline">
                    Скачать PDF
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={styles.navigation}>
              {step > 1 && step < 4 && (
                <Button variant="outline" onClick={handleBack}>
                  Назад
                </Button>
              )}
              <div className={styles.navRight}>
                {step < 3 && (
                  <Button variant="primary" onClick={handleNext} disabled={step === 1 && !file && !text.trim()}>
                    Далее
                  </Button>
                )}
                {step === 3 && (
                  <Button variant="primary" onClick={handleGenerate}>
                    Создать презентацию
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

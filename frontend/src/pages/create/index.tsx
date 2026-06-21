import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import Input from '@/components/Input/Input';
import Select from '@/components/Select/Select';
import TextArea from '@/components/TextArea/TextArea';
import FileUpload from '@/components/FileUpload/FileUpload';
import Loader from '@/components/Loader/Loader';
import StepIndicator from '@/components/StepIndicator/StepIndicator';
import styles from './create.module.css';
import { useAuthStore } from '@/store/authStore';
import {
  createPresentation,
  uploadFile,
  createPresentationFromFile,
  generateOutline,
  generateSlides,
  getTaskStatus,
  exportPresentation,
  getDownloadUrl,
  type Presentation,
  type TaskStatus,
} from '@/lib/presentations';

const steps = ['Загрузка', 'Настройки', 'Структура', 'Генерация', 'Результат'];

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

const styleOptions = [
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
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Step 1: Input
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');

  // Step 2: Settings
  const [type, setType] = useState('business');
  const [audience, setAudience] = useState('client');
  const [style, setStyle] = useState('business');
  const [slidesCount, setSlidesCount] = useState('10');
  const [language, setLanguage] = useState('ru');

  // API state
  const [presId, setPresId] = useState<string | null>(null);
  const [outline, setOutline] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportId, setExportId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <Container>
            <h1 className={styles.title}>Создание презентации</h1>
            <p>Загрузка...</p>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const handleFileSelect = (f: File) => {
    setFile(f);
    setError('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!file && !text.trim()) {
        setError('Загрузите файл или введите текст');
        return;
      }
      if (!title.trim()) {
        setError('Введите название презентации');
        return;
      }
    }
    setError('');
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  // Step 3→4: Create + generate
  const handleGenerate = async () => {
    setIsProcessing(true);
    setError('');

    try {
      let created: Presentation;
      let fileId: string | null = null;

      if (file) {
        const uploadRes = await uploadFile(file);
        fileId = uploadRes.id;

        created = await createPresentationFromFile(fileId, {
          title,
          type,
          audience,
          style,
          language,
          slides_count: parseInt(slidesCount) || 10,
        });
      } else {
        created = await createPresentation({
          title,
          type,
          audience,
          style,
          language,
          slides_count: parseInt(slidesCount) || 10,
        });

        // Сохраняем текст прямо в презентацию
        if (text.trim()) {
          const { updatePresentation } = await import('@/lib/presentations');
          await updatePresentation(created.id, { presentation_json: { raw_text: text } } as any);
        }
      }

      setPresId(created.id);
      setStep(3);

      // === Generate Outline ===
      const outlineTask = await generateOutline(created.id);
      setTaskStatus(outlineTask);

      // Poll outline
      const outlineResult = await pollUntilDone(outlineTask.id);
      if (!outlineResult || outlineResult.status === 'failed') {
        setError('Ошибка генерации структуры: ' + (outlineResult?.error_message || ''));
        setIsProcessing(false);
        return;
      }

      // === Generate Slides ===
      const slidesTask = await generateSlides(created.id);
      setTaskStatus(slidesTask);

      const slideResult = await pollUntilDone(slidesTask.id);
      if (!slideResult || slideResult.status === 'failed') {
        setError('Ошибка генерации слайдов: ' + (slideResult?.error_message || ''));
        setIsProcessing(false);
        return;
      }

      // Загружаем готовую презентацию
      const { getPresentation } = await import('@/lib/presentations');
      const pres = await getPresentation(created.id);
      setPresentation(pres);
      setOutline(pres.presentation_json);
      setStep(5);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Ошибка генерации');
    } finally {
      setIsProcessing(false);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  };

  const pollUntilDone = (taskId: string): Promise<TaskStatus | null> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60;

      const check = async () => {
        attempts++;
        try {
          const status = await getTaskStatus(taskId);
          setTaskStatus(status);

          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }
          if (attempts >= maxAttempts) {
            resolve(null);
            return;
          }
          setTimeout(check, 2000);
        } catch {
          setTimeout(check, 2000);
        }
      };
      check();
    });
  };

  const handleExport = async (format: 'pptx' | 'pdf') => {
    if (!presId) return;
    try {
      setError('');
      const result = await exportPresentation(presId, format);
      setExportId(result.id);
      window.open(getDownloadUrl(result.id), '_blank');
    } catch (err: any) {
      setError('Ошибка экспорта');
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Container>
          <h1 className={styles.title}>Создание презентации</h1>
          <StepIndicator steps={steps} currentStep={step} className={styles.steps} />

          {error && <div className={styles.error}>{error}</div>}

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
                    options={styleOptions}
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

            {/* Step 3: Generation status */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Генерация презентации</h2>
                <div className={styles.generationStatus}>
                  <div className={styles.spinner} />
                  <p className={styles.generationText}>
                    {taskStatus?.status === 'processing' || taskStatus?.status === 'pending'
                      ? 'Анализируем документ и формируем структуру...'
                      : 'Создаём слайды...'}
                  </p>
                  {taskStatus && (
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${taskStatus.progress || 50}%` }}
                      />
                    </div>
                  )}
                  <p className={styles.generationHint}>
                    Это может занять до 2 минут в зависимости от объёма данных
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Outline review */}
            {step === 4 && outline && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Структура презентации</h2>
                <p className={styles.stepDesc}>
                  Проверьте и отредактируйте структуру перед генерацией
                </p>
                <div className={styles.outline}>
                  {(outline as any)?.slides?.map((slide: any, i: number) => (
                    <div key={i} className={styles.outlineSlide}>
                      <span className={styles.outlineNum}>{slide.slide_number || i + 1}</span>
                      <div>
                        <strong>{slide.title || 'Слайд ' + (i + 1)}</strong>
                        {slide.content && Array.isArray(slide.content) && slide.content.length > 0 && (
                          <p>{slide.content[0]}</p>
                        )}
                      </div>
                      <span className={styles.outlineType}>{slide.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Result */}
            {step === 5 && presentation && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Презентация готова!</h2>
                <div className={styles.resultIcon}>🎉</div>
                <p className={styles.resultText}>
                  Презентация «{presentation.title}» создана и сохранена в вашем кабинете.
                  {' '}{presentation.slides_count} слайдов • {presentation.type}
                </p>
                <div className={styles.resultPreview}>
                  {presentation.presentation_json && (
                    <div className={styles.slidesPreview}>
                      {((presentation.presentation_json as any)?.slides || []).slice(0, 3).map((s: any, i: number) => (
                        <div key={i} className={styles.previewSlide}>
                          <div className={styles.previewSlideTitle}>{s.title}</div>
                          <div className={styles.previewSlideType}>{s.type}</div>
                          <ul className={styles.previewSlidePoints}>
                            {(s.content || []).slice(0, 2).map((c: string, j: number) => (
                              <li key={j}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.resultActions}>
                  <Button variant="primary" onClick={() => router.push('/dashboard')}>
                    К списку презентаций
                  </Button>
                  <Button variant="secondary" onClick={() => handleExport('pptx')}>
                    Скачать PPTX
                  </Button>
                  <Button variant="secondary" onClick={() => handleExport('pdf')}>
                    Скачать PDF
                  </Button>
                  {presId && (
                    <Button variant="ghost" onClick={() => router.push(`/edit?id=${presId}`)}>
                      Редактировать
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            {step < 3 && (
              <div className={styles.navigation}>
                {step > 1 && (
                  <Button variant="ghost" onClick={handleBack}>Назад</Button>
                )}
                <div className={styles.navRight}>
                  {step === 1 && (
                    <Button variant="primary" onClick={handleNext} disabled={!file && !text.trim()}>
                      Далее
                    </Button>
                  )}
                  {step === 2 && (
                    <Button variant="primary" onClick={handleGenerate} disabled={isProcessing}>
                      {isProcessing ? 'Генерация...' : 'Создать презентацию'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

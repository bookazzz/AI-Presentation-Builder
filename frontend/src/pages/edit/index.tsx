'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '@/components/SEO/SEO';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Container from '@/components/Container/Container';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import { useAuthStore } from '@/store/authStore';
import {
  getPresentation,
  updatePresentation,
  regenerateSlide,
  exportPresentation,
  getDownloadUrl,
  type Presentation,
} from '@/lib/presentations';
import styles from './edit.module.css';

export default function EditPresentation() {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  const [pres, setPres] = useState<Presentation | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [contentInputs, setContentInputs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!id) return;
    loadPresentation();
  }, [id, isAuthenticated]);

  const loadPresentation = async () => {
    try {
      setIsLoading(true);
      const data = await getPresentation(id as string);
      setPres(data);
      const pj = data.presentation_json as any;
      const sl = pj?.slides || [];
      setSlides(sl);
      if (sl.length > 0) {
        setContentInputs(sl[currentSlide]?.content || []);
      }
    } catch (err: any) {
      setError('Failed to load presentation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    setContentInputs(slides[index]?.content || []);
  };

  const handleContentChange = (index: number, value: string) => {
    const newInputs = [...contentInputs];
    newInputs[index] = value;
    setContentInputs(newInputs);
  };

  const addBullet = () => {
    setContentInputs([...contentInputs, '']);
  };

  const removeBullet = (index: number) => {
    setContentInputs(contentInputs.filter((_, i) => i !== index));
  };

  const saveSlide = async () => {
    if (!pres) return;
    setSaving(true);
    try {
      const updatedSlides = [...slides];
      updatedSlides[currentSlide] = {
        ...updatedSlides[currentSlide],
        content: contentInputs.filter(c => c.trim()),
      };
      await updatePresentation(pres.id, {
        presentation_json: { ...(pres.presentation_json as any), slides: updatedSlides },
      } as any);
      setSlides(updatedSlides);
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!pres) return;
    try {
      const result = await regenerateSlide(pres.id, currentSlide);
      setPres(result);
      const pj = result.presentation_json as any;
      if (pj?.slides) {
        setSlides(pj.slides);
        setContentInputs(pj.slides[currentSlide]?.content || []);
      }
    } catch {
      setError('Failed to regenerate');
    }
  };

  const removeSlide = async () => {
    if (!pres || slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== currentSlide);
    try {
      await updatePresentation(pres.id, {
        presentation_json: { ...(pres.presentation_json as any), slides: newSlides },
      } as any);
      setSlides(newSlides);
      setCurrentSlide(Math.max(0, currentSlide - 1));
    } catch {
      setError('Failed to remove slide');
    }
  };

  const moveSlide = (direction: 'up' | 'down') => {
    const idx = currentSlide;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const newSlides = [...slides];
    [newSlides[idx], newSlides[newIdx]] = [newSlides[newIdx], newSlides[idx]];
    setSlides(newSlides);
    setCurrentSlide(newIdx);
  };

  const handleExport = async (format: 'pptx' | 'pdf') => {
    if (!pres) return;
    try {
      const result = await exportPresentation(pres.id, format);
      window.open(getDownloadUrl(result.id), '_blank');
    } catch {
      setError('Export failed');
    }
  };

  if (!mounted) {
    return (
      <div className={styles.page}>
        <Header />
        <Container>
          <p>Loading...</p>
        </Container>
        <Footer />
      </div>
    );
  }
  if (!isAuthenticated) return null;
  if (isLoading) return <div className={styles.page}><Container><p>Loading...</p></Container></div>;

  return (
    <div className={styles.page}>
      <SEO
        title="Редактор презентации"
        description="Редактируйте слайды: меняйте текст, заголовки, порядок и дизайн перед экспортом."
        noindex
      />
      <Header />
      <main className={styles.main}>
        <Container>
          <div className={styles.editorLayout}>
            {/* Left: slide list */}
            <aside className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>Slides</h2>
              <div className={styles.slideList}>
                {slides.map((s, i) => (
                  <button
                    key={i}
                    className={`${styles.slideItem} ${i === currentSlide ? styles.slideItemActive : ''}`}
                    onClick={() => handleSlideChange(i)}
                  >
                    <span className={styles.slideNum}>{i + 1}</span>
                    <span className={styles.slideLabel}>{s.title || `Slide ${i + 1}`}</span>
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
                Back
              </Button>
            </aside>

            {/* Center: slide preview */}
            <section className={styles.center}>
              <div className={styles.previewHeader}>
                <h2 className={styles.previewTitle}>
                  Slide {currentSlide + 1}: {slides[currentSlide]?.title || 'Untitled'}
                </h2>
                <span className={styles.previewType}>{slides[currentSlide]?.type}</span>
                <div className={styles.previewNav}>
                  <Button variant="ghost" size="sm" onClick={() => moveSlide('up')} disabled={currentSlide === 0}>↑</Button>
                  <Button variant="ghost" size="sm" onClick={() => moveSlide('down')} disabled={currentSlide >= slides.length - 1}>↓</Button>
                  <Button variant="danger" size="sm" onClick={removeSlide}>Remove</Button>
                  <Button variant="secondary" size="sm" onClick={handleRegenerate}>Regenerate</Button>
                </div>
              </div>

              <Card className={styles.previewCard}>
                <div className={styles.previewSlideHeader}>
                  <h3>{slides[currentSlide]?.title || 'Slide Title'}</h3>
                  <span className={styles.previewSlideNum}>{currentSlide + 1} / {slides.length}</span>
                </div>
                <ul className={styles.bulletList}>
                  {contentInputs.map((item, i) => (
                    <li key={i} className={styles.bulletItem}>{item}</li>
                  ))}
                </ul>
              </Card>

              {error && <div className={styles.error}>{error}</div>}
            </section>

            {/* Right: editor */}
            <aside className={styles.editor}>
              <h2 className={styles.editorTitle}>Edit Content</h2>
              {contentInputs.map((item, i) => (
                <div key={i} className={styles.editorField}>
                  <textarea
                    className={styles.editorInput}
                    value={item}
                    onChange={(e) => handleContentChange(i, e.target.value)}
                    rows={2}
                  />
                  <button className={styles.removeBtn} onClick={() => removeBullet(i)}>×</button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addBullet}>+ Add bullet</Button>
              <div className={styles.editorActions}>
                <Button variant="primary" size="sm" onClick={saveSlide} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <hr className={styles.divider} />
              <h3 className={styles.editorSubtitle}>Export</h3>
              <Button variant="primary" onClick={() => handleExport('pptx')}>Download PPTX</Button>
              <Button variant="secondary" onClick={() => handleExport('pdf')}>Download PDF</Button>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

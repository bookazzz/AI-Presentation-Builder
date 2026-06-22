import Container from '@/components/Container/Container';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </span>
              AI Presentation Builder
            </div>
            <p className="footer__desc">
              Сервис, который превращает текстовые документы и Excel-отчёты в готовые бизнес-презентации с выводами, графиками и экспортом в PowerPoint.
            </p>
          </div>
          <div className="footer__links">
            <Link href="/pricing" className="footer__link">Тарифы</Link>
            <a href="#features" className="footer__link">Возможности</a>
            <a href="#faq" className="footer__link">FAQ</a>
          </div>
        </div>
        <div className="footer__bottom">
          <p className="footer__copyright">© {new Date().getFullYear()} Presentation Builder. Все права защищены.</p>
        </div>
      </Container>
    </footer>
  );
}

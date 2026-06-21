import Container from '@/components/Container/Container';


export default function Footer() {
  return (
    <footer className="footer">
      <Container>
        <p className="footer__text">
          AI Presentation Builder &copy; {new Date().getFullYear()}
        </p>
      </Container>
    </footer>
  );
}

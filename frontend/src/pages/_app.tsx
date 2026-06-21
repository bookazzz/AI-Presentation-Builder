import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../components/Header/Header.css';
import '../components/Footer/Footer.css';
import '../components/Container/Container.css';
import '../components/Button/Button.css';
import '../components/Input/Input.css';
import '../components/Select/Select.css';
import '../components/TextArea/TextArea.css';
import '../components/Card/Card.css';
import '../components/FileUpload/FileUpload.css';
import '../components/PresentationCard/PresentationCard.css';
import '../components/StepIndicator/StepIndicator.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

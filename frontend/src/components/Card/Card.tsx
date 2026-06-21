import './Card.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  text?: string;
  hover?: boolean;
  clickable?: boolean;
  accent?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  text,
  hover = false,
  clickable = false,
  accent = false,
  className = '',
  onClick,
}: CardProps) {
  const cls = [
    'card',
    hover ? 'card--hover' : '',
    clickable ? 'card--clickable' : '',
    accent ? 'card--bordered-accent' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} onClick={onClick}>
      {title && <h3 className="card__title">{title}</h3>}
      {text && <p className="card__text">{text}</p>}
      {children}
    </div>
  );
}

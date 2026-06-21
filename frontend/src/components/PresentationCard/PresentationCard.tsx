import Button from '@/components/Button/Button';


interface PresentationCardProps {
  id: string;
  title: string;
  type: string;
  status: string;
  slidesCount: number;
  createdAt: string;
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  outline: 'Структура готова',
  generating: 'Генерируется',
  completed: 'Готова',
  failed: 'Ошибка',
};

const typeLabels: Record<string, string> = {
  business: 'Бизнес',
  commercial: 'КП',
  pitch_deck: 'Pitch Deck',
  report: 'Отчёт',
  educational: 'Обучение',
  product: 'Продукт',
  excel: 'Excel',
  free: 'Свободный',
};

export default function PresentationCard({ id, title, type, status, slidesCount, createdAt, onView, onDownload, onDelete }: PresentationCardProps) {
  return (
    <div className="presentation-card">
      <div className="presentation-card__info">
        <div className="presentation-card__title">{title}</div>
        <div className="presentation-card__meta">
          <span>{typeLabels[type] || type}</span>
          <span>{slidesCount} слайдов</span>
          <span>{createdAt}</span>
          <span className={`presentation-card__badge presentation-card__badge--${status}`}>
            {statusLabels[status] || status}
          </span>
        </div>
      </div>
      <div className="presentation-card__actions">
        {onView && (
          <Button variant="secondary" size="sm" onClick={() => onView(id)}>
            Открыть
          </Button>
        )}
        {onDownload && (
          <Button variant="ghost" size="sm" onClick={() => onDownload(id)}>
            Скачать
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(id)}>
            Удалить
          </Button>
        )}
      </div>
    </div>
  );
}

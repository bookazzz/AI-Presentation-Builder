'use client';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  maxLength?: number;
  currentLength?: number;
}

export default function TextArea({ label, hint, maxLength, currentLength, className = '', id, ...props }: TextAreaProps) {
  const textareaId = id || props.name;

  return (
    <div className="textarea__wrapper">
      {label && (
        <label className="textarea__label" htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={['textarea', className].filter(Boolean).join(' ')}
        {...props}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {hint && <span className="textarea__hint">{hint}</span>}
        {maxLength !== undefined && (
          <span
            className={[
              'textarea__counter',
              (currentLength || 0) > maxLength ? 'textarea__counter--over' : '',
            ].filter(Boolean).join(' ')}
          >
            {(currentLength || 0).toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

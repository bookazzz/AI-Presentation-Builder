import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export default function Input({ label, hint, error, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="input__wrapper">
      {label && (
        <label className="input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={['input', error ? 'input--error' : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {hint && !error && <span className="input__hint">{hint}</span>}
      {error && <span className="input__error">{error}</span>}
    </div>
  );
}

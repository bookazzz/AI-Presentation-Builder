import './Select.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="select__wrapper">
      {label && (
        <label className="select__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select id={selectId} className={['select', className].filter(Boolean).join(' ')} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

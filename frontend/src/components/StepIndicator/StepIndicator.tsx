'use client';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => (
        <div key={step.id} className="step-indicator__step">
          <div
            className={[
              'step-indicator__circle',
              step.id === currentStep ? 'step-indicator__circle--active' : '',
              step.id < currentStep ? 'step-indicator__circle--done' : '',
            ].filter(Boolean).join(' ')}
          >
            {step.id < currentStep ? '✓' : step.id}
          </div>
          <span
            className={[
              'step-indicator__label',
              step.id === currentStep ? 'step-indicator__label--active' : '',
              step.id < currentStep ? 'step-indicator__label--done' : '',
            ].filter(Boolean).join(' ')}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={['step-indicator__line', step.id < currentStep ? 'step-indicator__line--done' : ''].filter(Boolean).join(' ')} />
          )}
        </div>
      ))}
    </div>
  );
}

import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 transition-colors duration-200';
  const normalClasses = 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500';
  const errorClasses = 'border-accent-500 focus:border-accent-500 focus:ring-accent-500';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          ${baseClasses}
          ${error ? errorClasses : normalClasses}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-accent-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-secondary-500">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
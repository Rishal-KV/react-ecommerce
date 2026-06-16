import React from 'react';

export const Select = React.forwardRef(({
  className = '',
  options = [],
  placeholder = 'Select an option',
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      <select
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 ${
          error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary/50'
        } ${className}`}
        ref={ref}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-500 mt-1 block animate-fade-in">{error}</span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

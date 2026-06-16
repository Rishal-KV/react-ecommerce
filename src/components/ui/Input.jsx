import React from 'react';

export const Input = React.forwardRef(({
  className = '',
  type = 'text',
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 ${
          error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary/50'
        } ${className}`}
        ref={ref}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1 block animate-fade-in">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

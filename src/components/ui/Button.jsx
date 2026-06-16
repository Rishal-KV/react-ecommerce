import React from 'react';

export const Button = React.memo(({
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95';
  
  const variants = {
    default: 'bg-primary text-white hover:bg-opacity-90 shadow-sm hover:shadow',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-opacity-80',
    outline: 'border border-input bg-transparent hover:bg-secondary text-foreground hover:text-secondary-foreground',
    ghost: 'hover:bg-secondary text-foreground hover:text-secondary-foreground',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-12 rounded-md px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

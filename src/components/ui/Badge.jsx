import React from 'react';

export const Badge = React.memo(({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring';
  
  const variants = {
    default: 'bg-white text-primary border border-primary/20 hover:bg-primary/5 dark:bg-primary/10 dark:text-primary dark:border-transparent dark:hover:bg-primary/20',
    secondary: 'bg-white text-secondary-foreground border border-border hover:bg-secondary/10 dark:bg-secondary dark:text-secondary-foreground dark:border-transparent dark:hover:bg-secondary/80',
    outline: 'bg-white text-foreground border border-input dark:bg-transparent dark:text-foreground dark:border-input',
    success: 'bg-white text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-transparent',
    warning: 'bg-white text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-transparent',
    danger: 'bg-white text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-transparent',
    info: 'bg-white text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-transparent',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

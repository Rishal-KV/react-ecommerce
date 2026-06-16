import React from 'react';

export const Alert = React.memo(({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-muted text-foreground border-border',
    destructive: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
  };

  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 text-sm [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Alert.displayName = 'Alert';

export const AlertTitle = React.memo(({ className = '', children, ...props }) => (
  <h5
    className={`mb-1 font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h5>
));

AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.memo(({ className = '', children, ...props }) => (
  <div
    className={`text-xs opacity-90 leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
));

AlertDescription.displayName = 'AlertDescription';

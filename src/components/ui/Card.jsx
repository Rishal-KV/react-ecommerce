import React from 'react';

export const Card = React.memo(({ className = '', children, ...props }) => {
  return (
    <div
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = React.memo(({ className = '', children, ...props }) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.memo(({ className = '', children, ...props }) => {
  return (
    <h3
      className={`font-semibold leading-none tracking-tight text-xl text-foreground ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.memo(({ className = '', children, ...props }) => {
  return (
    <p
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = React.memo(({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

export const CardFooter = React.memo(({ className = '', children, ...props }) => {
  return (
    <div
      className={`flex items-center p-6 pt-0 border-t border-border mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Dialog = React.memo(({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  // Prevent body scroll when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render modal to document.body to bypass parent CSS transform centering bugs
  const modalRoot = document.body;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card Box */}
      <div
        className={`relative z-10 w-full max-w-2xl transform overflow-hidden rounded-xl bg-card shadow-2xl transition-all border border-border animate-fade-in flex flex-col ${className}`}
      >
        {/* Header with padding */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-card">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Scrollable Content with padding */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 bg-card">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
});

Dialog.displayName = 'Dialog';

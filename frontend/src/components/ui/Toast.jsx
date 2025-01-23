import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TOAST_TYPES } from '@/lib/constants';
import { X } from 'lucide-react';

const toastStyles = {
  [TOAST_TYPES.SUCCESS]: 'bg-green-100 border-green-500 text-green-900',
  [TOAST_TYPES.ERROR]: 'bg-red-100 border-red-500 text-red-900',
  [TOAST_TYPES.WARNING]: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  [TOAST_TYPES.INFO]: 'bg-blue-100 border-blue-500 text-blue-900',
};

const Toast = ({
  message,
  type = TOAST_TYPES.INFO,
  onClose,
  duration = 5000,
  className,
  ...props
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex w-full max-w-sm items-center space-x-4',
        'rounded-lg border p-4 shadow-lg transition-all',
        toastStyles[type],
        className
      )}
      {...props}
    >
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-black/10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
};

export { Toast };

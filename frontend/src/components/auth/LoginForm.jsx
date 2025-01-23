import React from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  children,
  className
}) {
  return (
    <div className={cn('pb-6', className)}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

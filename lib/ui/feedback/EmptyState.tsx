import React from 'react';
import { twMerge } from 'tailwind-merge';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="text-gray-600 text-5xl mb-4">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

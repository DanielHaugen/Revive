import React from 'react';
import { FaCircleExclamation } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

type ErrorBannerProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorBanner({
  message,
  title = 'Something went wrong',
  onRetry,
  className,
}: ErrorBannerProps) {
  return (
    <div
      className={twMerge(
        'bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 flex items-start gap-3',
        className,
      )}
    >
      <FaCircleExclamation className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-200">{title}</p>
        <p className="text-red-300 text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-200 text-sm underline hover:text-red-100 mt-2"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

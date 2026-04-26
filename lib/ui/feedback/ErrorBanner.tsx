import React from 'react';
import { FaCircleExclamation } from 'react-icons/fa6';
import Banner from '@/lib/ui/feedback/Banner';
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
    <Banner
      variant="error"
      icon={<FaCircleExclamation className="text-red-500 text-lg flex-shrink-0 mt-0.5" />}
      onAction={onRetry}
      actionLabel="Retry"
      className={className}
    >
      <p className="font-semibold text-red-200">{title}</p>
      <p className="text-red-300 text-sm">{message}</p>
    </Banner>
  );
}

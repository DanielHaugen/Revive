import React from 'react';
import { twMerge } from 'tailwind-merge';

type BannerVariant = 'error' | 'warning' | 'info';

const variantMap: Record<BannerVariant, { bg: string; border: string; icon: string; text: string; actionText: string }> = {
  error:   { bg: 'bg-red-900 bg-opacity-40',    border: 'border-red-700',    icon: 'text-red-400',    text: 'text-red-300',    actionText: 'text-red-200 hover:text-red-100' },
  warning: { bg: 'bg-yellow-900 bg-opacity-40', border: 'border-yellow-700', icon: 'text-yellow-400', text: 'text-yellow-300', actionText: 'text-yellow-200 hover:text-yellow-100' },
  info:    { bg: 'bg-blue-900 bg-opacity-40',   border: 'border-blue-700',   icon: 'text-blue-400',   text: 'text-blue-300',   actionText: 'text-blue-200 hover:text-blue-100' },
};

type BannerProps = {
  variant: BannerVariant;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
  /** When true, renders as a full-width top banner (border-b, px-6 py-2). */
  topBar?: boolean;
};

/**
 * Shared base for alert banners.
 * Use the `topBar` prop for full-width Navbar-style banners (SyncBanner),
 * or the default card-style layout for inline page banners (ErrorBanner).
 */
export default function Banner({
  variant,
  icon,
  children,
  onAction,
  actionLabel,
  className,
  topBar = false,
}: BannerProps) {
  const { bg, border, text, actionText } = variantMap[variant];

  if (topBar) {
    return (
      <div className={twMerge(`${bg} border-b ${border} px-6 py-2 flex items-center gap-2 text-sm`, className)}>
        {icon}
        <span className={text}>{children}</span>
        {onAction && (
          <button
            onClick={onAction}
            className={`ml-auto ${actionText} underline text-xs`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={twMerge(`${bg} border ${border} rounded-lg p-4 flex items-start gap-3`, className)}>
      {icon}
      <div className="flex-1">
        {children}
        {onAction && (
          <button
            onClick={onAction}
            className={`${actionText} text-sm underline mt-2 block`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

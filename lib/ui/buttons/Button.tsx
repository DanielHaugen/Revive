import React from 'react';

type PrimaryButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'primary-outline'
    | 'secondary-outline'
    | 'success-outline'
    | 'danger-outline'
    | 'light'
    | 'light-outline'
    | 'dark'
    | 'dark-outline'; // Added dark variants
  rounded?: string;
};

// Function to get variant-specific Tailwind classes
const getVariantClassName = (variant: string) => {
  switch (variant) {
    case 'secondary':
      return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
    case 'success':
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
    case 'primary-outline':
      return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-100 focus:ring-blue-500';
    case 'secondary-outline':
      return 'border-2 border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white focus:ring-gray-500';
    case 'success-outline':
      return 'border-2 border-green-600 text-green-600 hover:bg-green-100 focus:ring-green-500';
    case 'danger-outline':
      return 'border-2 border-red-600 text-red-600 hover:bg-red-100 focus:ring-red-500';
    case 'light':
      return 'bg-white text-gray-800 hover:bg-gray-100 focus:ring-gray-300';
    case 'light-outline':
      return 'border-2 border-white text-white hover:bg-gray-200 hover:text-gray-800 focus:ring-gray-300';
    case 'dark':
      return 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-600';
    case 'dark-outline':
      return 'border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white focus:ring-gray-600';
    default: // primary (solid)
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  }
};

// Function to construct the complete className
const getButtonClassName = (
  disabled: boolean,
  variant: string,
  rounded: string,
  className?: string
) => {
  const baseClassName = `px-4 py-2 font-semibold ${rounded} shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50`;
  const disabledClassName = 'disabled:bg-gray-300 disabled:cursor-not-allowed';
  const variantClassName = getVariantClassName(variant);

  return `${baseClassName} ${variantClassName} ${
    disabled ? disabledClassName : ''
  } ${className || ''}`;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  children,
  disabled = false,
  className = '',
  ariaLabel,
  title,
  variant = 'primary', // Default variant
  rounded = 'rounded-lg',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClassName(disabled, variant, rounded, className)}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;

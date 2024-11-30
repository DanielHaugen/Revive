import React from 'react';

type PrimaryButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

const getButtonClassName = (disabled: boolean, className?: string) => {
  const baseClassName =
    'px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200';
  const disabledClassName = 'disabled:bg-gray-300 disabled:cursor-not-allowed';
  const hoverClassName =
    'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';

  return `${className || ''} ${baseClassName} ${
    disabled ? disabledClassName : hoverClassName
  }`;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  children,
  disabled = false,
  className = '',
  ariaLabel,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClassName(disabled, className)}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;

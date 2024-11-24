// /lib/ui/buttons/PrimaryButton.tsx
import React from 'react';

type PrimaryButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean; // Optional to disable the button
  className?: string; // Optional to pass additional classes
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  children,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
                  disabled:bg-gray-300 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;

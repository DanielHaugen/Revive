// /components/auth/PasswordStrengthIndicator.tsx
import React from 'react';

type PasswordStrengthIndicatorProps = {
  password: string;
  minCharacters?: number;
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  minCharacters = 8,
}) => {
  // Function to calculate password strength
  const getPasswordStrength = (password: string, minCharacters: number) => {
    let strength = 0;
    if (password.length >= minCharacters) strength++; // Minimum length
    if (/[A-Z]/.test(password)) strength++; // Uppercase letter
    if (/[a-z]/.test(password)) strength++; // Lowercase letter
    if (/[0-9]/.test(password)) strength++; // Digit
    if (/[\W]/.test(password)) strength++; // Special character
    return strength;
  };

  const strength = getPasswordStrength(password, minCharacters); // Strength score (0 to 5)

  const getColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-blue-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const indicatorClasses = 'h-2 rounded transition-all duration-300';

  return (
    <div className="mt-2 w-full bg-gray-200 rounded">
      <div
        className={`${indicatorClasses} ${getColor(strength)}`}
        style={{ width: `${strength * 20}%` }}
      />
    </div>
  );
};

export default PasswordStrengthIndicator;

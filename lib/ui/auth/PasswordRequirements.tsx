import { useState } from 'react';

type RequirementsProps = {
  password: string;
  minCharacters: number;
};

const PasswordRequirements: React.FC<RequirementsProps> = ({
  password,
  minCharacters,
}) => {
  const requirements = [
    {
      text: `At least ${minCharacters} characters`,
      test: (pw: string) => pw.length >= minCharacters,
    },
    {
      text: 'At least one uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      text: 'At least one lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
    { text: 'At least one number', test: (pw: string) => /\d/.test(pw) },
    {
      text: 'At least one special character',
      test: (pw: string) => /[!@#$%^&*]/.test(pw),
    },
  ];

  return (
    <ul className="list-none">
      {requirements.map((req, index) => {
        const isValid = req.test(password);
        return (
          <li
            key={index}
            className={`flex items-center ${
              isValid ? 'text-green-500' : 'text-gray-500'
            }`}
          >
            {isValid ? '✅' : '⚪️'}{' '}
            {/* Use different icons or emojis for checked/unchecked */}
            <span className="ml-2">{req.text}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRequirements;

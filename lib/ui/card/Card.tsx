// components/Card.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge('surface-card my-4 p-6 text-gray-100', className)}
    >
      {children}
    </div>
  );
};

export default Card;

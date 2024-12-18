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
      className={twMerge('bg-white rounded-lg shadow-md my-4 p-6', className)}
    >
      {children}
    </div>
  );
};

export default Card;

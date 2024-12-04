// components/Card.tsx
import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  margin?: string;
  padding?: string;
};

const Card: React.FC<CardProps> = ({
  children,
  className,
  margin = 'my-4',
  padding = 'p-6',
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md ${padding} ${margin} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;

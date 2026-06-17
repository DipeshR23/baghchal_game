import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl p-5 border border-slate-800/80 bg-slate-900/40 backdrop-blur-md text-slate-100 shadow-lg
        ${hoverable ? 'hover:border-slate-700/60 hover:bg-slate-900/60 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

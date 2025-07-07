import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-green-200 dark:border-green-700 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-green-800 dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}; 
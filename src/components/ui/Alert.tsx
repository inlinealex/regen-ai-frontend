import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full rounded-lg border border-gray-200 p-4 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {children}
    </div>
  );
}; 
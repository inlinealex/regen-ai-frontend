import React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, className = '' }) => {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-gray-900 transition-all dark:bg-gray-50"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}; 
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-white',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-white',
    outline: 'border border-green-200 text-green-700 dark:border-green-600 dark:text-white'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}; 
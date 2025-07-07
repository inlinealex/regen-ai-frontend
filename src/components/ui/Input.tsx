import React from 'react';

interface InputProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  id?: string;
}

export const Input: React.FC<InputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  className = '',
  id
}) => {
  // Convert number to string for input value
  const stringValue = typeof value === 'number' ? value.toString() : value;

  return (
    <input
      id={id}
      type={type}
      value={stringValue}
      onChange={onChange}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-600 dark:bg-gray-900 dark:text-white dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-green-500 ${className}`}
    />
  );
}; 
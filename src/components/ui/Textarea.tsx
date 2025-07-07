import React from 'react';

interface TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  readOnly?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  className = '',
  readOnly = false
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      className={`flex min-h-[80px] w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-600 dark:bg-gray-900 dark:text-white dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-green-500 ${className}`}
    />
  );
}; 
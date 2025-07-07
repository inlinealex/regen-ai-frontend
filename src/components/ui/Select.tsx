import React from 'react';

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export const SelectTrigger: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <button
      className={`flex h-10 w-full items-center justify-between rounded-md border border-green-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-600 dark:bg-gray-900 dark:text-white dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-green-500 ${className}`}
    >
      {children}
      <span className="ml-2">▼</span>
    </button>
  );
};

export const SelectContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-green-200 bg-white p-1 text-gray-950 shadow-md dark:border-green-600 dark:bg-gray-900 dark:text-white ${className}`}>
      {children}
    </div>
  );
};

export const SelectItem: React.FC<{ 
  children: React.ReactNode; 
  value: string;
  className?: string;
}> = ({ children, value, className = '' }) => {
  return (
    <button
      className={`relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-green-100 focus:text-green-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-green-900/20 dark:focus:text-white ${className}`}
    >
      {children}
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span className="text-sm">{placeholder}</span>;
}; 
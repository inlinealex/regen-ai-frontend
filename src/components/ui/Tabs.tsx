import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<{ 
  children: React.ReactNode; 
  value: string; 
  onValueChange: (value: string) => void;
  className?: string;
}> = ({ children, value, onValueChange, className = '' }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-green-100 dark:bg-gray-900 p-1 text-green-600 dark:text-white ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<{ 
  children: React.ReactNode; 
  value: string;
  className?: string;
}> = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-green-500 ${
        isActive 
          ? 'bg-white text-green-800 shadow-sm dark:bg-green-800/30 dark:text-white' 
          : 'hover:bg-green-200 hover:text-green-900 dark:hover:bg-gray-800 dark:hover:text-gray-200'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ 
  children: React.ReactNode; 
  value: string;
  className?: string;
}> = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-green-500 ${className}`}>
      {children}
    </div>
  );
}; 
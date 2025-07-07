import React from 'react';

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked = false, onCheckedChange, className = '' }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:focus-visible:ring-green-500 dark:focus-visible:ring-offset-gray-950 dark:data-[state=checked]:bg-green-600 dark:data-[state=unchecked]:bg-gray-700 ${
        checked ? 'bg-green-600 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${className}`}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}; 
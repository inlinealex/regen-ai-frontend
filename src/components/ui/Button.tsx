import { cn } from '../../utils/cn';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'default';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700',
    outline: 'border border-green-200 text-green-700 hover:bg-green-50 focus-visible:ring-green-500 dark:border-green-600 dark:text-white dark:hover:bg-green-900/20',
    ghost: 'text-green-700 hover:bg-green-50 focus-visible:ring-green-500 dark:text-white dark:hover:bg-green-900/20',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    default: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700'
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 rounded-md text-sm',
    md: 'h-10 py-2 px-4',
    lg: 'h-11 px-8 rounded-md'
  };
  
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  return (
    <button
      className={classes}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
} 
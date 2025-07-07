import React from 'react';
import { cn } from '../../utils/cn';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const Slider = React.forwardRef<
  HTMLInputElement,
  SliderProps
>(({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onValueChange([newValue]);
  };

  const percentage = ((value[0] || 0) - min) / (max - min) * 100;

  return (
    <div className={cn('relative flex w-full items-center', className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || 0}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        style={{
          background: `linear-gradient(to right, #22c55e 0%, #22c55e ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
        }}
        {...props}
      />
    </div>
  );
});

Slider.displayName = 'Slider';

export { Slider }; 
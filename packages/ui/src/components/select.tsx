import * as React from 'react';
import { cn } from '../utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      id,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[#44403c] dark:text-[#d6d3d1] tracking-tight"
          >
            {label}
            {props.required && <span className="text-[#dc2626] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-9 sm:h-10 w-full appearance-none rounded-[5px] border border-[#d6d3cb] bg-white px-3 py-2 pr-8 text-xs sm:text-sm text-[#1c1917] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-colors focus-visible:outline-none focus-visible:border-[#78716c] focus-visible:ring-1 focus-visible:ring-[#78716c] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#383532] dark:bg-[#161412] dark:text-[#f5f5f4] dark:focus-visible:border-[#a8a29e] dark:focus-visible:ring-[#a8a29e]',
              error && 'border-[#dc2626] focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626] dark:border-[#ef4444]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#78716c] dark:text-[#a8a29e]">
            <ChevronDown className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        {error && (
          <p className="text-[11px] text-[#dc2626] dark:text-[#ef4444] font-medium leading-tight">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-[#78716c] dark:text-[#a8a29e] leading-tight">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

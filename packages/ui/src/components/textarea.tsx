import * as React from 'react';
import { cn } from '../utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, disabled, ...props }, ref) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium text-[#44403c] dark:text-[#d6d3d1] tracking-tight"
          >
            {label}
            {props.required && <span className="text-[#dc2626] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex min-h-[80px] w-full rounded-[5px] border border-[#d6d3cb] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-colors focus-visible:outline-none focus-visible:border-[#78716c] focus-visible:ring-1 focus-visible:ring-[#78716c] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#383532] dark:bg-[#161412] dark:text-[#f5f5f4] dark:placeholder:text-[#78716c] dark:focus-visible:border-[#a8a29e] dark:focus-visible:ring-[#a8a29e]',
            error && 'border-[#dc2626] focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626] dark:border-[#ef4444]',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[11px] text-[#dc2626] dark:text-[#ef4444] font-medium leading-tight">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[#78716c] dark:text-[#a8a29e] leading-tight">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

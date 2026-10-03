import * as React from 'react';
import { cn } from '../utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-[5px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78716c] focus-visible:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none select-none active:translate-y-[0.5px] cursor-pointer tracking-tight';

    const variants = {
      primary:
        'bg-[#1c1917] text-[#fafaf9] hover:bg-[#292524] border border-[#1c1917] shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.15)] dark:bg-[#f5f5f4] dark:text-[#1c1917] dark:hover:bg-[#e7e5e4] dark:border-[#f5f5f4]',
      secondary:
        'bg-[#f4f3ef] text-[#1c1917] hover:bg-[#eae8e1] border border-[#e2dfd7] shadow-[0_1px_1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-[#262422] dark:text-[#f5f5f4] dark:border-[#383532] dark:hover:bg-[#2e2b28]',
      outline:
        'bg-transparent text-[#292524] border border-[#d6d3cb] hover:bg-[#f4f3ef] hover:border-[#b8b3a7] shadow-[0_1px_1px_rgba(0,0,0,0.02)] dark:text-[#d6d3d1] dark:border-[#44403c] dark:hover:bg-[#1c1917] dark:hover:border-[#57534e]',
      ghost:
        'bg-transparent text-[#44403c] hover:bg-[#f4f3ef] dark:text-[#a8a29e] dark:hover:bg-[#262422] dark:hover:text-[#f5f5f4]',
      destructive:
        'bg-[#991b1b] text-white hover:bg-[#7f1d1d] border border-[#7f1d1d] shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.15)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 font-medium',
      md: 'h-9 px-4 text-xs sm:text-sm gap-2 font-medium',
      lg: 'h-11 px-6 text-sm sm:text-base gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

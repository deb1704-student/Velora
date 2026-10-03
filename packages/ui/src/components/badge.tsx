import * as React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'destructive' | 'outline';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium tracking-tight border transition-colors select-none';

  const variants = {
    neutral:
      'bg-[#f4f3ef] text-[#292524] border-[#e2ded6] shadow-[0_1px_1px_rgba(0,0,0,0.02)] dark:bg-[#262320] dark:text-[#d6d3d1] dark:border-[#3d3935]',
    success:
      'bg-[#f0f5f1] text-[#1b4332] border-[#c2ded0] shadow-[0_1px_1px_rgba(0,0,0,0.02)] dark:bg-[#14261c] dark:text-[#86efac] dark:border-[#1e4630]',
    warning:
      'bg-[#fdf6ec] text-[#854d0e] border-[#fae8c8] shadow-[0_1px_1px_rgba(0,0,0,0.02)] dark:bg-[#291b08] dark:text-[#fde047] dark:border-[#4d3410]',
    destructive:
      'bg-[#fdf2f2] text-[#991b1b] border-[#fbc8c8] shadow-[0_1px_1px_rgba(0,0,0,0.02)] dark:bg-[#2d0e0e] dark:text-[#fca5a5] dark:border-[#541616]',
    outline:
      'bg-transparent text-[#44403c] border-[#d6d3cb] dark:text-[#a8a29e] dark:border-[#383532]',
  };

  const dotColors = {
    neutral: 'bg-[#78716c]',
    success: 'bg-[#16a34a]',
    warning: 'bg-[#ca8a04]',
    destructive: 'bg-[#dc2626]',
    outline: 'bg-[#78716c]',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}

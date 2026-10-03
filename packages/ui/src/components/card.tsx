import * as React from 'react';
import { cn } from '../utils';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[8px] border border-[#e5e2da] bg-white text-[#1c1917] shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_1px_rgba(0,0,0,0.02)] transition-all dark:border-[#2e2b27] dark:bg-[#181614] dark:text-[#f5f5f4]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 p-5 sm:p-6 border-b border-[#f0eee6] dark:border-[#272421]',
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-base sm:text-lg font-semibold leading-tight tracking-tight text-[#1c1917] dark:text-[#f5f5f4]',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center p-5 sm:p-6 pt-0 border-t border-[#f0eee6] dark:border-[#272421] mt-auto',
        className
      )}
      {...props}
    />
  );
}

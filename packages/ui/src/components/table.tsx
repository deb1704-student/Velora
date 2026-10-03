import * as React from 'react';
import { cn } from '../utils';

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-md border border-zinc-200 dark:border-zinc-800">
      <table
        className={cn('w-full caption-bottom text-xs text-left', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('bg-zinc-50 border-b border-zinc-200 text-zinc-600 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400', className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn('divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950', className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-9 px-4 text-left font-semibold uppercase tracking-wider text-[11px] text-zinc-500 dark:text-zinc-400 align-middle',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('p-4 align-middle text-zinc-800 dark:text-zinc-200', className)}
      {...props}
    />
  );
}

import * as React from 'react';
import { cn } from '../utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-xs text-zinc-500', className)}
      {...props}
    >
      <ol className="flex items-center space-x-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-zinc-400 shrink-0" />
              )}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="hover:text-zinc-900 transition-colors dark:hover:text-zinc-100"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    isLast
                      ? 'font-medium text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

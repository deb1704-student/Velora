import * as React from 'react';
import { cn } from '../utils';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-[6px] border border-dashed border-[#ded8cb] bg-[#faf8f5]',
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-[5px] bg-[#f0ece1] border border-[#ded8cb] flex items-center justify-center text-[#1a1816] mb-4">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-lg font-normal text-[#1a1816] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#736b63] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
              className="h-8 text-xs px-3"
            >
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
              className="h-8 text-xs px-3 uppercase tracking-wider font-semibold"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

import * as React from 'react';
import { cn } from '../utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  errorDetails?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = 'Unable to Load Data',
  description = 'An error occurred while connecting to the Velora service. Please check your connection and try again.',
  errorDetails,
  onRetry,
  isRetrying = false,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-rose-200 bg-rose-50/40 dark:border-rose-950 dark:bg-rose-950/20',
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 mb-4 dark:bg-rose-900/40 dark:text-rose-400">
        <AlertCircle className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-rose-700/80 dark:text-rose-300/80 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>

      {errorDetails && (
        <pre className="text-[10px] font-mono p-2 mb-5 rounded bg-white/80 border border-rose-200 text-rose-800 max-w-md overflow-x-auto text-left dark:bg-zinc-950 dark:border-rose-900 dark:text-rose-300">
          {errorDetails}
        </pre>
      )}

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          isLoading={isRetrying}
          className="border-rose-300 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Retry Request</span>
        </Button>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { ErrorState } from '@velora/ui';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Unhandled web error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorState
          title="Something went wrong"
          description="We encountered an unexpected error while loading this page. Our service team has received the diagnostics."
          errorDetails={error.message || 'Error digest: ' + error.digest}
          onRetry={() => reset()}
        />
      </div>
    </div>
  );
}

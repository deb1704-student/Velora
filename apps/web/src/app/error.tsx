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
    <div className="min-h-[65vh] flex items-center justify-center p-4 bg-[#faf8f5]">
      <div className="max-w-md w-full">
        <ErrorState
          title="Service Interface Disruption"
          description="An unexpected condition interrupted page rendering. You may attempt to reload the interface or return to the main catalog."
          errorDetails={error.message || 'Diagnostic digest: ' + error.digest}
          onRetry={() => reset()}
        />
      </div>
    </div>
  );
}

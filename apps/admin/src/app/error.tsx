'use client';

import * as React from 'react';
import { ErrorState } from '@velora/ui';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Unhandled admin console error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorState
          title="Console Error Encountered"
          description="Failed to load administrative dataset. Please verify database connectivity."
          errorDetails={error.message || 'Digest: ' + error.digest}
          onRetry={() => reset()}
        />
      </div>
    </div>
  );
}

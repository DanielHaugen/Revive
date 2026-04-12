'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-gray-300">Something went wrong</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  );
}

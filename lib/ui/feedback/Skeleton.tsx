import { twMerge } from 'tailwind-merge';

type SkeletonProps = {
  className?: string;
};

/** A single pulsing placeholder bar. Compose multiples for different layouts. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        'animate-pulse rounded bg-gray-800',
        className,
      )}
    />
  );
}

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

/** Skeleton matching the DataTable layout. */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="bg-gray-800 border-b border-gray-700 flex gap-4 px-6 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-6 py-4 border-t border-gray-800"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton matching the Card + InfoSection detail layout. */
export function DetailSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 space-y-8">
      {/* Title */}
      <Skeleton className="h-6 w-1/3" />
      {/* Field grid */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      {/* Second section */}
      <Skeleton className="h-6 w-1/4" />
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

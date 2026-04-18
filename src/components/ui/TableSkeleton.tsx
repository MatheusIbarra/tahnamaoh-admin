interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-muted/70">
          <tr>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <th key={`head-${columnIndex}`} className="px-4 py-3 text-left">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="border-t border-border">
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <td key={`cell-${rowIndex}-${columnIndex}`} className="px-4 py-3">
                  <div className="h-3 w-full max-w-36 animate-pulse rounded bg-muted/80" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function AppSectionLoading() {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <div className="h-6 w-52 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted/80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`kpi-${index}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-muted/80" />
          </article>
        ))}
      </div>

      <TableSkeleton rows={6} columns={5} />
    </section>
  );
}

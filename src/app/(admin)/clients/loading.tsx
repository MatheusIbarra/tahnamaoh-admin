import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function ClientsLoading() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="h-6 w-52 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted/80" />
      </div>

      <article className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1.5">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded bg-muted/80" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded bg-muted/80" />
        </div>
        <div className="flex items-end gap-2">
          <div className="h-9 w-20 animate-pulse rounded bg-muted/80" />
          <div className="h-9 w-20 animate-pulse rounded bg-muted/80" />
        </div>
      </article>

      <TableSkeleton rows={8} columns={6} />
    </section>
  );
}

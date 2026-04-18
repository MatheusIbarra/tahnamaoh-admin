import Link from "next/link";

import { getDriverReviewSnapshot } from "@/server/actions/admin/drivers";
import { CoreApiError } from "@/server/core/coreErrors";

interface DriverDetailsPageProps {
  params: Promise<{ driverId: string }>;
}

export default async function DriverDetailsPage({ params }: DriverDetailsPageProps) {
  const { driverId } = await params;
  let errorMessage: string | null = null;
  let snapshot:
    | Awaited<ReturnType<typeof getDriverReviewSnapshot>>
    | null = null;

  try {
    snapshot = await getDriverReviewSnapshot(driverId);
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError
        ? error.message
        : "Falha ao carregar detalhe do motorista.";
  }

  return (
    <section className="space-y-4">
      <Link href="/drivers" className="text-sm text-secondary hover:underline">
        Voltar para lista
      </Link>

      {errorMessage ? (
        <article className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </article>
      ) : (
        <>
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Snapshot do motorista</h2>
            <pre className="mt-3 overflow-auto rounded-md bg-muted/60 p-3 text-xs text-foreground">
              {JSON.stringify(snapshot?.driver ?? {}, null, 2)}
            </pre>
          </article>

          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-base font-semibold">Documentos recentes</h3>
            <pre className="mt-3 overflow-auto rounded-md bg-muted/60 p-3 text-xs text-foreground">
              {JSON.stringify(snapshot?.latestDocuments ?? [], null, 2)}
            </pre>
          </article>
        </>
      )}
    </section>
  );
}

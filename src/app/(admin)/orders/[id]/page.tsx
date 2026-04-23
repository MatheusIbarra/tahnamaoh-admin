import Link from "next/link";

import { getOrderDetails } from "@/server/actions/admin/orders";
import { CoreApiError } from "@/server/core/coreErrors";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return "-";
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  let payload: Record<string, unknown> | null = null;
  let errorMessage: string | null = null;

  try {
    payload = asRecord(await getOrderDetails(id));
  } catch (error) {
    errorMessage = error instanceof CoreApiError ? error.message : "Falha ao carregar detalhe do pedido.";
  }

  return (
    <section className="space-y-4">
      <Link href="/orders" className="text-sm text-secondary hover:underline">
        Voltar para listagem
      </Link>

      {errorMessage ? (
        <article className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </article>
      ) : (
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Detalhe do Pedido</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs">{asString(payload?.id ?? payload?._id ?? id)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{asString(payload?.status)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cliente</dt>
              <dd>{asString(payload?.customerName)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Motorista</dt>
              <dd>{asString(payload?.driverName)}</dd>
            </div>
          </dl>
        </article>
      )}
    </section>
  );
}

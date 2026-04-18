import { listOrders } from "@/server/actions/admin/orders";
import { CoreApiError } from "@/server/core/coreErrors";

export default async function OrdersPage() {
  let errorMessage: string | null = null;
  let result:
    | Awaited<ReturnType<typeof listOrders>>
    | null = null;

  try {
    result = await listOrders(1, 20);
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError ? error.message : "Falha ao carregar pedidos.";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Gestão de Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Listagem administrativa e preparação para atualização em tempo real.
        </p>
      </div>

      {errorMessage ? (
        <article className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-accent-foreground">
          {errorMessage}
        </article>
      ) : (
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total de pedidos retornados: {result?.total ?? 0}
          </p>
          <pre className="mt-3 overflow-auto rounded-md bg-muted/60 p-3 text-xs">
            {JSON.stringify(result?.items ?? [], null, 2)}
          </pre>
        </article>
      )}
    </section>
  );
}

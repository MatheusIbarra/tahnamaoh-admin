import { StatusBadge } from "@/components/ui/StatusBadge";
import { listOrders } from "@/server/actions/admin/orders";
import { CoreApiError } from "@/server/core/coreErrors";

function formatCurrency(value?: number): string {
  if (typeof value !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

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

          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted/70">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Pedido</th>
                  <th className="px-3 py-2 text-left font-medium">Cliente</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Valor total</th>
                  <th className="px-3 py-2 text-left font-medium">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {result && result.items.length > 0 ? (
                  result.items.map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-xs">{order.id}</td>
                      <td className="px-3 py-2">{order.customerName ?? "-"}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-3 py-2">{order.createdAt ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}

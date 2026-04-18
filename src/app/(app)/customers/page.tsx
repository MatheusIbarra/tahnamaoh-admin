import { listCustomers } from "@/server/actions/admin/customers";
import { CoreApiError } from "@/server/core/coreErrors";

export default async function CustomersPage() {
  let errorMessage: string | null = null;
  let result:
    | Awaited<ReturnType<typeof listCustomers>>
    | null = null;

  try {
    result = await listCustomers(1, 20);
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError ? error.message : "Falha ao carregar clientes.";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Gestão de Clientes</h2>
        <p className="text-sm text-muted-foreground">
          Listagem administrativa sincronizada com o core.
        </p>
      </div>

      {errorMessage ? (
        <article className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-accent-foreground">
          {errorMessage}
        </article>
      ) : (
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total de clientes retornados: {result?.total ?? 0}
          </p>
          <pre className="mt-3 overflow-auto rounded-md bg-muted/60 p-3 text-xs">
            {JSON.stringify(result?.items ?? [], null, 2)}
          </pre>
        </article>
      )}
    </section>
  );
}

import { StatusBadge } from "@/components/ui/StatusBadge";
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
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted/70">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Nome</th>
                  <th className="px-3 py-2 text-left font-medium">E-mail</th>
                  <th className="px-3 py-2 text-left font-medium">Telefone</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {result && result.items.length > 0 ? (
                  result.items.map((customer) => (
                    <tr key={customer.id} className="border-t border-border">
                      <td className="px-3 py-2">{customer.fullName ?? "-"}</td>
                      <td className="px-3 py-2">{customer.email ?? "-"}</td>
                      <td className="px-3 py-2">{customer.phone ?? "-"}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="px-3 py-2">{customer.createdAt ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      Nenhum cliente encontrado.
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

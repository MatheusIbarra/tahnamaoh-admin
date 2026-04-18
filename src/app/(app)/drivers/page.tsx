import Link from "next/link";

import { DriverStatusBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { listPendingDrivers } from "@/server/actions/admin/drivers";
import { CoreApiError } from "@/server/core/coreErrors";

export default async function DriversPage() {
  let errorMessage: string | null = null;
  let pending:
    | Awaited<ReturnType<typeof listPendingDrivers>>
    | null = null;

  try {
    pending = await listPendingDrivers(1, 20);
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError
        ? error.message
        : "Falha ao carregar motoristas pendentes.";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Gestão de Motoristas</h2>
        <p className="text-sm text-muted-foreground">
          Pendentes de análise administrativa.
        </p>
      </div>

      {errorMessage ? (
        <article className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </article>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Onboarding</th>
                <th className="px-4 py-3 text-left font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {pending && pending.items.length > 0 ? (
                pending.items.map((driver) => (
                  <tr key={driver._id} className="border-t border-border">
                    <td className="px-4 py-3">{driver.fullName}</td>
                    <td className="px-4 py-3">
                      <DriverStatusBadge status={driver.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={driver.onboardingStep} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/drivers/${driver._id}`}
                        className="rounded-md border border-border px-2 py-1 text-xs font-medium text-secondary hover:bg-secondary/10"
                      >
                        Ver detalhe
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum motorista pendente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

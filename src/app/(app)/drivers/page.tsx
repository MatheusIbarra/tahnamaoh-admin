import Link from "next/link";

import { DriverStatusBadge } from "@/components/ui/StatusBadge";
import {
  getDriversAction,
  type DriverListItem,
  type DriverListStatus,
} from "@/server/actions/admin/drivers";
import { CoreApiError } from "@/server/core/coreErrors";

const DRIVER_STATUSES: Array<{ value: DriverListStatus; label: string }> = [
  { value: "PENDENTE_APROVACAO", label: "Pendente de aprovação" },
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "EM_CORRIDA", label: "Em corrida" },
  { value: "BLOQUEADO", label: "Bloqueado" },
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

interface DriversPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

function parseStatus(value?: string): DriverListStatus | undefined {
  if (!value) {
    return undefined;
  }

  return DRIVER_STATUSES.some((item) => item.value === value)
    ? (value as DriverListStatus)
    : undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeDriverId(driver: DriverListItem): string {
  return String(driver.id ?? driver._id ?? "");
}

function normalizeDriverName(driver: DriverListItem): string {
  return driver.fullName ?? driver.name ?? "-";
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function buildPageHref(page: number, status?: DriverListStatus, search?: string, limit = DEFAULT_LIMIT): string {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) {
    query.set("status", status);
  }
  if (search?.trim()) {
    query.set("search", search.trim());
  }
  return `/drivers?${query.toString()}`;
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const query = await searchParams;
  const status = parseStatus(query.status);
  const search = query.search?.trim() ? query.search.trim() : undefined;
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInt(query.limit, DEFAULT_LIMIT);

  let errorMessage: string | null = null;
  let result: Awaited<ReturnType<typeof getDriversAction>> | null = null;

  try {
    result = await getDriversAction({
      status,
      search,
      page,
      limit,
    });
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError
        ? error.message
        : "Falha ao carregar listagem de motoristas.";
  }

  const currentPage = result?.page ?? page;
  const pageSize = result?.limit ?? limit;
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Gestão de Motoristas</h2>
        <p className="text-sm text-muted-foreground">
          Listagem administrativa com filtros por status e busca por nome/CPF.
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <div className="space-y-1.5">
          <label htmlFor="driver-search" className="text-xs text-muted-foreground">
            Buscar por nome ou CPF
          </label>
          <input
            id="driver-search"
            name="search"
            type="search"
            defaultValue={search ?? ""}
            placeholder="Ex.: João ou 12345678900"
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="driver-status" className="text-xs text-muted-foreground">
            Status
          </label>
          <select
            id="driver-status"
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {DRIVER_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="limit" value={String(limit)} />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Filtrar
          </button>
          <Link
            href="/drivers"
            className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Limpar
          </Link>
        </div>
      </form>

      {errorMessage ? (
        <article className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </article>
      ) : (
        <article className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted/70">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">CPF</th>
                  <th className="px-4 py-3 text-left font-medium">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Data de cadastro</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {result && result.items.length > 0 ? (
                  result.items.map((driver) => {
                    const driverId = normalizeDriverId(driver);
                    return (
                      <tr key={driverId || `${driver.cpf ?? "driver"}-${driver.createdAt ?? ""}`} className="border-t border-border">
                        <td className="px-4 py-3">{normalizeDriverName(driver)}</td>
                        <td className="px-4 py-3">{driver.cpf ?? "-"}</td>
                        <td className="px-4 py-3">{driver.phone ?? "-"}</td>
                        <td className="px-4 py-3">
                          <DriverStatusBadge status={driver.status} />
                        </td>
                        <td className="px-4 py-3">{formatDate(driver.createdAt)}</td>
                        <td className="px-4 py-3">
                          {driverId ? (
                            <Link
                              href={`/drivers/${driverId}`}
                              className="rounded-md border border-border px-2 py-1 text-xs font-medium text-secondary transition hover:bg-secondary/10"
                            >
                              Ver detalhe
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem detalhe</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum motorista encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Página {currentPage} de {totalPages} ({total} motorista(s))
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={buildPageHref(Math.max(1, currentPage - 1), status, search, limit)}
                className={`rounded border px-2 py-1 ${hasPreviousPage ? "hover:bg-muted" : "pointer-events-none opacity-40"}`}
              >
                Anterior
              </Link>
              <Link
                href={buildPageHref(Math.min(totalPages, currentPage + 1), status, search, limit)}
                className={`rounded border px-2 py-1 ${hasNextPage ? "hover:bg-muted" : "pointer-events-none opacity-40"}`}
              >
                Próxima
              </Link>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

import Link from "next/link";

import { getClientsAction, type ClientListItem } from "@/server/actions/admin/clients";
import { CoreApiError } from "@/server/core/coreErrors";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

interface ClientsPageProps {
  searchParams: Promise<{
    name?: string;
    email?: string;
    page?: string;
    limit?: string;
  }>;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeClientId(client: ClientListItem): string {
  return String(client.id ?? client._id ?? "");
}

function normalizeClientName(client: ClientListItem): string {
  return client.name ?? client.fullName ?? "-";
}

function normalizeStatus(value?: string): "ATIVO" | "BLOQUEADO" {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  return normalized === "BLOCKED" || normalized === "BLOQUEADO" ? "BLOQUEADO" : "ATIVO";
}

function renderStatusBadge(value?: string) {
  const status = normalizeStatus(value);
  const classes =
    status === "BLOQUEADO"
      ? "border-destructive/35 bg-destructive/10 text-destructive"
      : "border-success/35 bg-success/10 text-success";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
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

function buildPageHref(page: number, name?: string, email?: string, limit = DEFAULT_LIMIT): string {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (name?.trim()) {
    query.set("name", name.trim());
  }

  if (email?.trim()) {
    query.set("email", email.trim());
  }

  return `/clients?${query.toString()}`;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const query = await searchParams;
  const name = query.name?.trim() ? query.name.trim() : undefined;
  const email = query.email?.trim() ? query.email.trim() : undefined;
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInt(query.limit, DEFAULT_LIMIT);

  let errorMessage: string | null = null;
  let result: Awaited<ReturnType<typeof getClientsAction>> | null = null;

  try {
    result = await getClientsAction({
      name,
      email,
      page,
      limit,
    });
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError ? error.message : "Falha ao carregar listagem de clientes.";
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
        <h2 className="text-xl font-semibold">Gestão de Clientes</h2>
        <p className="text-sm text-muted-foreground">
          Busca por nome e e-mail com paginação server-side.
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1.5">
          <label htmlFor="client-name" className="text-xs text-muted-foreground">
            Nome
          </label>
          <input
            id="client-name"
            name="name"
            type="search"
            defaultValue={name ?? ""}
            placeholder="Ex.: Maria Oliveira"
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="client-email" className="text-xs text-muted-foreground">
            E-mail
          </label>
          <input
            id="client-email"
            name="email"
            type="search"
            defaultValue={email ?? ""}
            placeholder="maria@email.com"
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end gap-2">
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="limit" value={String(limit)} />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Buscar
          </button>
          <Link
            href="/clients"
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
                  <th className="px-4 py-3 text-left font-medium">E-mail</th>
                  <th className="px-4 py-3 text-left font-medium">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Data de cadastro</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {result && result.items.length > 0 ? (
                  result.items.map((client) => {
                    const clientId = normalizeClientId(client);
                    return (
                      <tr key={clientId || `${client.email ?? "client"}-${client.createdAt ?? ""}`} className="border-t border-border">
                        <td className="px-4 py-3">{normalizeClientName(client)}</td>
                        <td className="px-4 py-3">{client.email ?? "-"}</td>
                        <td className="px-4 py-3">{client.phone ?? "-"}</td>
                        <td className="px-4 py-3">{renderStatusBadge(client.status)}</td>
                        <td className="px-4 py-3">{formatDate(client.createdAt)}</td>
                        <td className="px-4 py-3">
                          {clientId ? (
                            <Link
                              href={`/clients/${clientId}`}
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
                      Nenhum cliente encontrado para os filtros informados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Página {currentPage} de {totalPages} ({total} cliente(s))
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={buildPageHref(Math.max(1, currentPage - 1), name, email, limit)}
                className={`rounded border px-2 py-1 ${hasPreviousPage ? "hover:bg-muted" : "pointer-events-none opacity-40"}`}
              >
                Anterior
              </Link>
              <Link
                href={buildPageHref(Math.min(totalPages, currentPage + 1), name, email, limit)}
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

import Link from "next/link";

import { getOrdersAction, type AdminOrderItem } from "@/server/actions/admin/orders";
import { CoreApiError } from "@/server/core/coreErrors";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type OrderStatusFilter = "PENDENTE" | "EM_ANDAMENTO" | "ENTREGUE" | "CANCELADO";

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    startDate?: string;
    endDate?: string;
    customer?: string;
    driver?: string;
    page?: string;
    limit?: string;
  }>;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeOrderId(order: AdminOrderItem): string {
  return String(order.id ?? order._id ?? order.orderId ?? "");
}

function normalizeOrderStatus(status?: string): OrderStatusFilter | "UNKNOWN" {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase();
  if (normalized === "PENDENTE" || normalized === "PENDING") {
    return "PENDENTE";
  }
  if (normalized === "EM_ANDAMENTO" || normalized === "IN_PROGRESS") {
    return "EM_ANDAMENTO";
  }
  if (normalized === "ENTREGUE" || normalized === "DELIVERED") {
    return "ENTREGUE";
  }
  if (normalized === "CANCELADO" || normalized === "CANCELED" || normalized === "CANCELLED") {
    return "CANCELADO";
  }
  return "UNKNOWN";
}

function renderOrderStatusBadge(status?: string) {
  const normalizedStatus = normalizeOrderStatus(status);
  const statusMap = {
    PENDENTE: {
      label: "PENDENTE",
      classes: "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    EM_ANDAMENTO: {
      label: "EM_ANDAMENTO",
      classes: "border-secondary/35 bg-secondary/10 text-secondary",
    },
    ENTREGUE: {
      label: "ENTREGUE",
      classes: "border-success/35 bg-success/10 text-success",
    },
    CANCELADO: {
      label: "CANCELADO",
      classes: "border-destructive/35 bg-destructive/10 text-destructive",
    },
    UNKNOWN: {
      label: String(status ?? "-")
        .trim()
        .toUpperCase() || "-",
      classes: "border-border bg-muted text-muted-foreground",
    },
  } as const;

  const tone = statusMap[normalizedStatus];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone.classes}`}>
      {tone.label}
    </span>
  );
}

function formatCurrency(value?: number): string {
  if (typeof value !== "number") {
    return "-";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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

function buildPageHref({
  page,
  limit,
  status,
  startDate,
  endDate,
  customer,
  driver,
}: {
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  customer?: string;
  driver?: string;
}): string {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status?.trim()) {
    query.set("status", status.trim());
  }
  if (startDate?.trim()) {
    query.set("startDate", startDate.trim());
  }
  if (endDate?.trim()) {
    query.set("endDate", endDate.trim());
  }
  if (customer?.trim()) {
    query.set("customer", customer.trim());
  }
  if (driver?.trim()) {
    query.set("driver", driver.trim());
  }

  return `/orders?${query.toString()}`;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const query = await searchParams;
  const status = query.status?.trim() ? query.status.trim() : undefined;
  const startDate = query.startDate?.trim() ? query.startDate.trim() : undefined;
  const endDate = query.endDate?.trim() ? query.endDate.trim() : undefined;
  const customer = query.customer?.trim() ? query.customer.trim() : undefined;
  const driver = query.driver?.trim() ? query.driver.trim() : undefined;
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInt(query.limit, DEFAULT_LIMIT);

  let errorMessage: string | null = null;
  let result: Awaited<ReturnType<typeof getOrdersAction>> | null = null;

  try {
    result = await getOrdersAction({
      status,
      startDate,
      endDate,
      customer,
      driver,
      page,
      limit,
    });
  } catch (error) {
    errorMessage = error instanceof CoreApiError ? error.message : "Falha ao carregar listagem de pedidos.";
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
        <h2 className="text-xl font-semibold">Gestão de Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Filtre por status, período, cliente e motorista com paginação server-side.
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
        <div className="space-y-1.5">
          <label htmlFor="orders-status" className="text-xs text-muted-foreground">
            Status
          </label>
          <select
            id="orders-status"
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="PENDENTE">PENDENTE</option>
            <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
            <option value="ENTREGUE">ENTREGUE</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="orders-start-date" className="text-xs text-muted-foreground">
            Data inicial
          </label>
          <input
            id="orders-start-date"
            name="startDate"
            type="date"
            defaultValue={startDate ?? ""}
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="orders-end-date" className="text-xs text-muted-foreground">
            Data final
          </label>
          <input
            id="orders-end-date"
            name="endDate"
            type="date"
            defaultValue={endDate ?? ""}
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="orders-customer" className="text-xs text-muted-foreground">
            Cliente (nome/e-mail)
          </label>
          <input
            id="orders-customer"
            name="customer"
            type="search"
            defaultValue={customer ?? ""}
            placeholder="Ex.: maria@email.com"
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="orders-driver" className="text-xs text-muted-foreground">
            Motorista (nome)
          </label>
          <input
            id="orders-driver"
            name="driver"
            type="search"
            defaultValue={driver ?? ""}
            placeholder="Ex.: João Silva"
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
            href="/orders"
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
                  <th className="px-4 py-3 text-left font-medium">ID do pedido</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Motorista</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Valor total</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {result && result.items.length > 0 ? (
                  result.items.map((order) => {
                    const orderId = normalizeOrderId(order);
                    return (
                      <tr
                        key={orderId || `${order.customerName ?? "order"}-${order.createdAt ?? ""}`}
                        className="border-t border-border"
                      >
                        <td className="px-4 py-3 font-mono text-xs">{orderId || "-"}</td>
                        <td className="px-4 py-3">{order.customerName ?? order.customerEmail ?? "-"}</td>
                        <td className="px-4 py-3">{order.driverName ?? "-"}</td>
                        <td className="px-4 py-3">{renderOrderStatusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(order.totalAmount ?? order.total)}</td>
                        <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          {orderId ? (
                            <Link
                              href={`/orders/${orderId}`}
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
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum pedido encontrado para os filtros informados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Página {currentPage} de {totalPages} ({total} pedido(s))
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={buildPageHref({
                  page: Math.max(1, currentPage - 1),
                  limit,
                  status,
                  startDate,
                  endDate,
                  customer,
                  driver,
                })}
                className={`rounded border px-2 py-1 ${hasPreviousPage ? "hover:bg-muted" : "pointer-events-none opacity-40"}`}
              >
                Anterior
              </Link>
              <Link
                href={buildPageHref({
                  page: Math.min(totalPages, currentPage + 1),
                  limit,
                  status,
                  startDate,
                  endDate,
                  customer,
                  driver,
                })}
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

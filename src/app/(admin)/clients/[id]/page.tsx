import Link from "next/link";

import { ActionToast } from "@/components/admin/ActionToast";
import { ClientAdminActions } from "@/components/admin/ClientAdminActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getClientByIdAction,
  type ClientAddressItem,
  type ClientOrderHistoryItem,
} from "@/server/actions/admin/clients";
import { CoreApiError } from "@/server/core/coreErrors";

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    historyPage?: string;
    action?: string;
    result?: string | string[];
    message?: string | string[];
  }>;
}

const ORDER_HISTORY_PAGE_SIZE = 10;

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
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

function formatCurrency(value?: number): string {
  if (typeof value !== "number") {
    return "-";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function resolveAddressLabel(address: ClientAddressItem): string {
  return address.label ?? "Endereco";
}

function resolveAddressLine(address: ClientAddressItem): string {
  const number = address.number ? `, ${address.number}` : "";
  const complement = address.complement ? ` - ${address.complement}` : "";
  return `${address.street ?? "-"}${number}${complement}`;
}

function resolveAddressRegion(address: ClientAddressItem): string {
  const parts = [address.neighborhood, address.city, address.state].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
  if (parts.length === 0) {
    return "-";
  }
  return parts.join(" - ");
}

function extractAddresses(payload: Record<string, unknown>): ClientAddressItem[] {
  const candidates = [payload.addresses, payload.savedAddresses, payload.address];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }
    return candidate
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        id: asString(item.id) ?? asString(item._id),
        label: asString(item.label) ?? asString(item.type) ?? asString(item.name),
        street: asString(item.street) ?? asString(item.addressLine1) ?? asString(item.address),
        number: asString(item.number),
        complement: asString(item.complement) ?? asString(item.addressLine2),
        neighborhood: asString(item.neighborhood) ?? asString(item.district),
        city: asString(item.city),
        state: asString(item.state) ?? asString(item.uf),
        zipCode: asString(item.zipCode) ?? asString(item.postalCode),
      }));
  }
  return [];
}

function extractOrderHistory(payload: Record<string, unknown>): ClientOrderHistoryItem[] {
  const candidates = [payload.orderHistory, payload.orders, payload.ordersHistory];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }
    return candidate
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        id: asString(item.id) ?? asString(item._id),
        createdAt: asString(item.createdAt) ?? asString(item.date),
        status: asString(item.status),
        totalAmount: asNumber(item.totalAmount) ?? asNumber(item.total) ?? asNumber(item.value),
      }));
  }
  return [];
}

function buildHistoryPageHref(clientId: string, page: number): string {
  return `/clients/${clientId}?historyPage=${page}`;
}

export default async function ClientDetailPage({ params, searchParams }: ClientDetailPageProps) {
  const { id: clientId } = await params;
  const query = await searchParams;

  let payload: Record<string, unknown> | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await getClientByIdAction(clientId);
    payload = asRecord(response.customer ?? response.client ?? response);
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError
        ? error.message
        : "Nao foi possivel carregar os detalhes do cliente.";
  }

  const addresses = extractAddresses(payload ?? {});
  const orderHistory = extractOrderHistory(payload ?? {});
  const page = Math.max(1, Number.parseInt(query.historyPage ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(orderHistory.length / ORDER_HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ORDER_HISTORY_PAGE_SIZE;
  const pagedOrders = orderHistory.slice(startIndex, startIndex + ORDER_HISTORY_PAGE_SIZE);

  const toastResult = firstQueryValue(query.result);
  const toastMessage = firstQueryValue(query.message);
  const actionToastVariant = toastResult === "success" ? "success" : "error";
  const actionToastMessage = toastMessage;

  if (errorMessage) {
    return (
      <section className="space-y-4">
        <Link href="/clients" className="text-sm text-secondary hover:underline">
          Voltar para listagem
        </Link>
        <article className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </article>
      </section>
    );
  }

  const currentStatus = asString(payload?.status) ?? "-";
  const customerName = asString(payload?.name) ?? asString(payload?.fullName) ?? "-";

  return (
    <section className="space-y-5">
      <ActionToast message={actionToastMessage} variant={actionToastVariant} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/clients" className="text-sm text-secondary hover:underline">
          Voltar para listagem
        </Link>
        <ClientAdminActions clientId={clientId} status={currentStatus} />
      </div>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Dados pessoais</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nome</dt>
            <dd>{customerName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd>{asString(payload?.email) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefone</dt>
            <dd>{asString(payload?.phone) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">CPF</dt>
            <dd>{asString(payload?.cpf) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status atual</dt>
            <dd>
              <StatusBadge status={currentStatus} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Data de cadastro</dt>
            <dd>{formatDate(asString(payload?.createdAt))}</dd>
          </div>
        </dl>
      </article>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold">Enderecos salvos</h3>

        {addresses.length > 0 ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {addresses.map((address, index) => (
              <article
                key={address.id ?? `address-${index}`}
                className="rounded-lg border border-border bg-muted/20 p-3 text-sm"
              >
                <p className="font-medium">{resolveAddressLabel(address)}</p>
                <p className="mt-1 text-muted-foreground">{resolveAddressLine(address)}</p>
                <p className="text-muted-foreground">{resolveAddressRegion(address)}</p>
                <p className="text-muted-foreground">CEP: {address.zipCode ?? "-"}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum endereco salvo para este cliente.</p>
        )}
      </article>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold">Historico de pedidos</h3>

        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/70">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Pedido</th>
                <th className="px-3 py-2 text-left font-medium">Data</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.length > 0 ? (
                pagedOrders.map((order, index) => (
                  <tr key={order.id ?? `order-${index}`} className="border-t border-border">
                    <td className="px-3 py-2">{order.id ?? "-"}</td>
                    <td className="px-3 py-2">{formatDate(order.createdAt)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    Nenhum pedido encontrado para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Pagina {safePage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Link
              href={buildHistoryPageHref(clientId, Math.max(1, safePage - 1))}
              className={`rounded border px-2 py-1 ${
                safePage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
              }`}
            >
              Anterior
            </Link>
            <Link
              href={buildHistoryPageHref(clientId, Math.min(totalPages, safePage + 1))}
              className={`rounded border px-2 py-1 ${
                safePage >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-muted"
              }`}
            >
              Proxima
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

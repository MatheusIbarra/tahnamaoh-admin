import Link from "next/link";

import { ActionToast } from "@/components/admin/ActionToast";
import { DriverAdminActions } from "@/components/admin/DriverAdminActions";
import {
  getDriverByIdAction,
  type DriverRaceHistoryItem,
} from "@/server/actions/admin/driverDetails";
import { CoreApiError } from "@/server/core/coreErrors";

interface DriverDetailPageProps {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{
    historyPage?: string;
    action?: string;
    result?: string;
    message?: string;
  }>;
}

const HISTORY_PAGE_SIZE = 10;

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

function extractRaceHistory(driver: Record<string, unknown>): DriverRaceHistoryItem[] {
  const candidates = [
    driver.raceHistory,
    driver.ridesHistory,
    driver.rides,
    driver.trips,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          id: asString(item.id) ?? asString(item._id),
          date: asString(item.date) ?? asString(item.createdAt),
          status: asString(item.status),
          origin: asString(item.origin) ?? asString(item.pickupAddress),
          destination: asString(item.destination) ?? asString(item.dropoffAddress),
          distanceKm: asNumber(item.distanceKm),
          totalValue: asNumber(item.totalValue) ?? asNumber(item.fare),
        }));
    }
  }
  return [];
}

function extractCnh(driver: Record<string, unknown>): Record<string, unknown> {
  const cnh = driver.cnh ?? driver.driverLicense ?? {};
  return asRecord(cnh);
}

function extractVehicle(driver: Record<string, unknown>): Record<string, unknown> {
  const vehicle = driver.vehicle ?? driver.vehicleInfo ?? {};
  return asRecord(vehicle);
}

export default async function DriverDetailPage({
  params,
  searchParams,
}: DriverDetailPageProps) {
  const { driverId } = await params;
  const query = await searchParams;

  let driver: Record<string, unknown> | null = null;
  let errorMessage: string | null = null;

  try {
    const details = await getDriverByIdAction(driverId);
    driver = asRecord(details.driver);
  } catch (error) {
    errorMessage =
      error instanceof CoreApiError
        ? error.message
        : "Nao foi possivel carregar os detalhes do motorista.";
  }

  const currentStatus = asString(driver?.status) ?? "-";
  const cnh = extractCnh(driver ?? {});
  const vehicle = extractVehicle(driver ?? {});
  const raceHistory = extractRaceHistory(driver ?? {});

  const page = Math.max(1, Number.parseInt(query.historyPage ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(raceHistory.length / HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * HISTORY_PAGE_SIZE;
  const pagedHistory = raceHistory.slice(startIndex, startIndex + HISTORY_PAGE_SIZE);

  const actionToastVariant = query.result === "success" ? "success" : "error";
  const actionToastMessage = query.message;

  if (errorMessage) {
    return (
      <section className="space-y-4">
        <Link href="/drivers" className="text-sm text-secondary hover:underline">
          Voltar para listagem
        </Link>
        <article className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <ActionToast message={actionToastMessage} variant={actionToastVariant} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/drivers" className="text-sm text-secondary hover:underline">
          Voltar para listagem
        </Link>
        <DriverAdminActions driverId={driverId} status={currentStatus} />
      </div>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Dados pessoais</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nome</dt>
            <dd>{asString(driver?.fullName) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">CPF</dt>
            <dd>{asString(driver?.cpf) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd>{asString(driver?.email) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefone</dt>
            <dd>{asString(driver?.phone) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status atual</dt>
            <dd className="font-semibold">{currentStatus}</dd>
          </div>
        </dl>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold">CNH</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Numero</dt>
              <dd>{asString(cnh.number) ?? asString(cnh.documentNumber) ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Categoria</dt>
              <dd>{asString(cnh.category) ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Validade</dt>
              <dd>{asString(cnh.expirationDate) ?? asString(cnh.expiresAt) ?? "-"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold">Veiculo</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Modelo</dt>
              <dd>{asString(vehicle.model) ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Placa</dt>
              <dd>{asString(vehicle.plate) ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cor</dt>
              <dd>{asString(vehicle.color) ?? "-"}</dd>
            </div>
          </dl>
        </article>
      </div>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold">Historico de corridas</h3>

        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/70">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Data</th>
                <th className="px-3 py-2 text-left font-medium">Origem</th>
                <th className="px-3 py-2 text-left font-medium">Destino</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.length > 0 ? (
                pagedHistory.map((ride, index) => (
                  <tr key={ride.id ?? `ride-${index}`} className="border-t border-border">
                    <td className="px-3 py-2">{ride.date ?? "-"}</td>
                    <td className="px-3 py-2">{ride.origin ?? "-"}</td>
                    <td className="px-3 py-2">{ride.destination ?? "-"}</td>
                    <td className="px-3 py-2">{ride.status ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
                      {typeof ride.totalValue === "number"
                        ? ride.totalValue.toFixed(2)
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Nenhuma corrida encontrada para este motorista.
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
              href={`/drivers/${driverId}?historyPage=${Math.max(1, safePage - 1)}`}
              className={`rounded border px-2 py-1 ${
                safePage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
              }`}
            >
              Anterior
            </Link>
            <Link
              href={`/drivers/${driverId}?historyPage=${Math.min(totalPages, safePage + 1)}`}
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

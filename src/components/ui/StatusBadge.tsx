interface StatusBadgeProps {
  status?: string | null;
}

type BadgeTone = "neutral" | "info" | "warning" | "success" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-secondary/35 bg-secondary/10 text-secondary",
  warning: "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  success: "border-success/35 bg-success/10 text-success",
  danger: "border-destructive/35 bg-destructive/10 text-destructive",
};

const DRIVER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_REVIEW: "Pendente de revisão",
  PENDENTE_APROVACAO: "Pendente de revisão",
  APPROVED: "Aprovado",
  DISPONIVEL: "Disponível",
  EM_CORRIDA: "Em corrida",
  REJECTED: "Rejeitado",
  BLOCKED: "Bloqueado",
  BLOQUEADO: "Bloqueado",
};

function normalizeStatus(status?: string | null): string {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

function humanizeStatus(status?: string | null): string {
  const normalized = normalizeStatus(status);
  if (!normalized) {
    return "-";
  }
  return normalized
    .toLowerCase()
    .split(/[_-]/g)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function resolveGenericTone(status?: string | null): BadgeTone {
  const normalized = normalizeStatus(status);

  if (!normalized) {
    return "neutral";
  }

  if (
    normalized.includes("BLOCK") ||
    normalized.includes("BLOQUE") ||
    normalized.includes("REJECT") ||
    normalized.includes("CANCEL") ||
    normalized.includes("ERROR") ||
    normalized.includes("FAILED")
  ) {
    return "danger";
  }

  if (
    normalized.includes("APPROV") ||
    normalized.includes("ACTIVE") ||
    normalized.includes("ATIVO") ||
    normalized.includes("COMPLETE") ||
    normalized.includes("SUCCESS")
  ) {
    return "success";
  }

  if (
    normalized.includes("PENDING") ||
    normalized.includes("PENDENTE") ||
    normalized.includes("REVIEW") ||
    normalized.includes("ANAL")
  ) {
    return "warning";
  }

  if (
    normalized.includes("DRAFT") ||
    normalized.includes("OPEN") ||
    normalized.includes("PROGRESS") ||
    normalized.includes("ANDAMENTO")
  ) {
    return "info";
  }

  return "neutral";
}

function renderBadge(label: string, tone: BadgeTone) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  );
}

export function DriverStatusBadge({ status }: StatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const label = DRIVER_STATUS_LABELS[normalized] ?? humanizeStatus(status);
  const tone =
    normalized === "PENDENTE_APROVACAO"
      ? "warning"
      : normalized === "DISPONIVEL"
        ? "success"
        : normalized === "EM_CORRIDA"
          ? "info"
          : normalized === "BLOQUEADO"
            ? "danger"
            : resolveGenericTone(normalized);
  return renderBadge(label, tone);
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = humanizeStatus(status);
  const tone = resolveGenericTone(status);
  return renderBadge(label, tone);
}

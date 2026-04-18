"use client";

import { useState } from "react";

import {
  approveDriverAction,
  blockDriverAction,
  unblockDriverAction,
} from "@/server/actions/admin/driverDetails";

interface DriverAdminActionsProps {
  driverId: string;
  status?: string;
}

function isPendingApproval(status?: string): boolean {
  return status === "PENDENTE_APROVACAO" || status === "PENDING_REVIEW";
}

function isBlocked(status?: string): boolean {
  return status === "BLOQUEADO" || status === "BLOCKED";
}

export function DriverAdminActions({ driverId, status }: DriverAdminActionsProps) {
  const pendingApproval = isPendingApproval(status);
  const blocked = isBlocked(status);
  const [modalMode, setModalMode] = useState<"approve" | "block" | null>(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {pendingApproval ? (
            <button
              type="button"
              onClick={() => setModalMode("approve")}
              className="rounded-md bg-success px-3 py-2 text-xs font-semibold text-success-foreground transition hover:opacity-90"
            >
              Aprovar motorista
            </button>
        ) : null}

        {!blocked ? (
          <button
            type="button"
            onClick={() => setModalMode("block")}
            className="rounded-md border border-destructive px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
          >
            Bloquear
          </button>
        ) : null}

        {blocked ? (
          <form action={unblockDriverAction}>
            <input type="hidden" name="driverId" value={driverId} />
            <button
              type="submit"
              className="rounded-md border border-secondary px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-secondary/10"
            >
              Desbloquear
            </button>
          </form>
        ) : null}
      </div>

      {modalMode === "approve" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-driver-title"
            className="w-full max-w-xl rounded-xl border border-border bg-card p-5 shadow-lg"
          >
            <h3 id="approve-driver-title" className="text-base font-semibold">
              Aprovar motorista
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              O backend exige justificativa para aprovacao. Preencha os dados da revisao antes de confirmar.
            </p>

            <form action={approveDriverAction} className="mt-4 space-y-4">
              <input type="hidden" name="driverId" value={driverId} />

              <div className="space-y-1">
                <label htmlFor="approve-reason" className="text-xs text-muted-foreground">
                  Motivo da aprovacao *
                </label>
                <textarea
                  id="approve-reason"
                  name="reason"
                  required
                  minLength={3}
                  rows={3}
                  className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex.: Documentacao validada e cadastro consistente."
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="approve-notes" className="text-xs text-muted-foreground">
                  Observacoes internas
                </label>
                <textarea
                  id="approve-notes"
                  name="notes"
                  rows={2}
                  className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Anotacoes opcionais para auditoria."
                />
              </div>

              <div className="grid gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="checkedCpfMatch" className="h-4 w-4 accent-primary" />
                  CPF confere com os dados enviados
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="checkedFaceMatch" className="h-4 w-4 accent-primary" />
                  Face match validado
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="checkedDocumentReadability"
                    className="h-4 w-4 accent-primary"
                  />
                  Documentos legiveis
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="checkedFraudSignals" className="h-4 w-4 accent-primary" />
                  Sem sinais de fraude
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-success px-3 py-2 text-xs font-semibold text-success-foreground transition hover:opacity-90"
                >
                  Confirmar aprovacao
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {modalMode === "block" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-driver-title"
            className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-lg"
          >
            <h3 id="block-driver-title" className="text-base font-semibold">
              Confirmar bloqueio
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Para bloquear o motorista, informe o motivo. Ele ficara impedido de operar ate ser desbloqueado.
            </p>

            <form action={blockDriverAction} className="mt-4 space-y-4">
              <input type="hidden" name="driverId" value={driverId} />

              <div className="space-y-1">
                <label htmlFor="block-reason" className="text-xs text-muted-foreground">
                  Motivo do bloqueio *
                </label>
                <textarea
                  id="block-reason"
                  name="reason"
                  required
                  minLength={3}
                  rows={3}
                  className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex.: inconsistencias nos documentos apresentados."
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="block-notes" className="text-xs text-muted-foreground">
                  Observacoes internas
                </label>
                <textarea
                  id="block-notes"
                  name="notes"
                  rows={2}
                  className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Anotacoes opcionais para auditoria."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground transition hover:opacity-90"
                >
                  Confirmar bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

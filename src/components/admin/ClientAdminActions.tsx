"use client";

import { useEffect, useRef, useState } from "react";

import { blockClientAction, unblockClientAction } from "@/server/actions/admin/clients";
import { SubmitButton } from "@/components/ui/SubmitButton";

interface ClientAdminActionsProps {
  clientId: string;
  status?: string;
}

function normalizeStatus(status?: string): "ATIVO" | "BLOQUEADO" | "UNKNOWN" {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase();
  if (normalized === "ATIVO" || normalized === "ACTIVE") {
    return "ATIVO";
  }
  if (normalized === "BLOQUEADO" || normalized === "BLOCKED") {
    return "BLOQUEADO";
  }
  return "UNKNOWN";
}

export function ClientAdminActions({ clientId, status }: ClientAdminActionsProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const blockDialogRef = useRef<HTMLDivElement>(null);
  const normalizedStatus = normalizeStatus(status);
  const canBlock = normalizedStatus === "ATIVO";
  const canUnblock = normalizedStatus === "BLOQUEADO";

  useEffect(() => {
    if (!showBlockDialog) {
      return;
    }

    const dialog = blockDialogRef.current;
    if (!dialog) {
      return;
    }

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (element) => !element.hasAttribute("disabled"),
    );
    focusableElements[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowBlockDialog(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled"),
      );
      if (elements.length === 0) {
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showBlockDialog]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {canBlock ? (
          <button
            type="button"
            onClick={() => setShowBlockDialog(true)}
            className="rounded-md border border-destructive px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
          >
            Bloquear cliente
          </button>
        ) : null}

        {canUnblock ? (
          <form action={unblockClientAction}>
            <input type="hidden" name="clientId" value={clientId} />
            <SubmitButton
              pendingLabel="Desbloqueando..."
              className="rounded-md border border-secondary px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-secondary/10"
            >
              Desbloquear cliente
            </SubmitButton>
          </form>
        ) : null}
      </div>

      {showBlockDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowBlockDialog(false);
            }
          }}
        >
          <div
            ref={blockDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-client-title"
            className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-lg animate-in zoom-in-95 duration-200"
          >
            <h3 id="block-client-title" className="text-base font-semibold">
              Confirmar bloqueio
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              O cliente ficará impedido de acessar o aplicativo até ser desbloqueado.
            </p>

            <form action={blockClientAction} className="mt-4 space-y-4">
              <input type="hidden" name="clientId" value={clientId} />

              <div className="space-y-1">
                <label htmlFor="block-client-reason" className="text-xs text-muted-foreground">
                  Motivo do bloqueio (opcional)
                </label>
                <textarea
                  id="block-client-reason"
                  name="reason"
                  rows={3}
                  className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex.: atividade suspeita identificada."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlockDialog(false)}
                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <SubmitButton
                  pendingLabel="Bloqueando..."
                  className="rounded-md bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground transition hover:opacity-90"
                >
                  Confirmar bloqueio
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

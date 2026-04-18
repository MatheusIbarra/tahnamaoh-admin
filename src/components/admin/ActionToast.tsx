"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ActionToastProps {
  message?: string;
  variant?: "success" | "error";
  durationMs?: number;
}

const TOAST_QUERY_KEYS = ["action", "result", "message"];

export function ActionToast({
  message,
  variant = "success",
  durationMs = 4500,
}: ActionToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toastKey = `${variant}:${message ?? ""}`;
  const [closingToastKey, setClosingToastKey] = useState<string | null>(null);
  const [dismissedToastKey, setDismissedToastKey] = useState<string | null>(null);
  const cleanedToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!message || dismissedToastKey === toastKey) {
      return;
    }
    const leaveTimer = window.setTimeout(() => setClosingToastKey(toastKey), durationMs);
    const closeTimer = window.setTimeout(
      () => setDismissedToastKey(toastKey),
      durationMs + 180,
    );

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(closeTimer);
    };
  }, [dismissedToastKey, durationMs, message, toastKey]);

  useEffect(() => {
    if (!message || cleanedToastKeyRef.current === toastKey) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const key of TOAST_QUERY_KEYS) {
      nextParams.delete(key);
    }
    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
    cleanedToastKeyRef.current = toastKey;
  }, [message, pathname, router, searchParams, toastKey]);

  const appearance = useMemo(() => {
    if (variant === "success") {
      return {
        icon: "✓",
        title: "Sucesso",
        role: "status" as const,
        className:
          "border-success/35 bg-card text-foreground shadow-[0_10px_30px_-12px_rgba(34,197,94,0.5)]",
        iconClass: "bg-success text-success-foreground",
      };
    }

    return {
      icon: "!",
      title: "Erro",
      role: "alert" as const,
      className:
        "border-destructive/35 bg-card text-foreground shadow-[0_10px_30px_-12px_rgba(212,24,61,0.55)]",
      iconClass: "bg-destructive text-destructive-foreground",
    };
  }, [variant]);

  const isVisible = Boolean(message) && dismissedToastKey !== toastKey;
  const isLeaving = closingToastKey === toastKey;

  if (!isVisible || !message) {
    return null;
  }

  const animationClass = isLeaving
    ? "translate-y-1 opacity-0"
    : "translate-y-0 opacity-100";

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <div
        role={appearance.role}
        aria-live={appearance.role === "alert" ? "assertive" : "polite"}
        className={[
          "w-[calc(100vw-2rem)] max-w-sm rounded-xl border p-3 transition-all duration-200",
          appearance.className,
          animationClass,
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <span
            className={[
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              appearance.iconClass,
            ].join(" ")}
            aria-hidden="true"
          >
            {appearance.icon}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{appearance.title}</p>
            <p className="mt-0.5 wrap-break-word text-sm text-muted-foreground">{message}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setClosingToastKey(toastKey);
              window.setTimeout(() => setDismissedToastKey(toastKey), 180);
            }}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Fechar notificacao"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}

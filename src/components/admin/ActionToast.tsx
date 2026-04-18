"use client";

interface ActionToastProps {
  message?: string;
  variant?: "success" | "error";
}

export function ActionToast({ message, variant = "success" }: ActionToastProps) {
  if (!message) {
    return null;
  }

  const variantClass =
    variant === "success"
      ? "border-success/40 bg-success/15 text-success"
      : "border-destructive/40 bg-destructive/15 text-destructive";

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50">
      <div className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${variantClass}`}>
        {message}
      </div>
    </div>
  );
}

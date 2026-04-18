"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pendingLabel?: string;
  pendingIcon?: ReactNode;
}

function mergeClasses(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function SubmitButton({
  children,
  className,
  disabled,
  pendingLabel = "Enviando...",
  pendingIcon,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type={props.type ?? "submit"}
      disabled={disabled || pending}
      aria-busy={pending}
      className={mergeClasses(
        "inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {pending ? (
        <>
          {pendingIcon ?? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />}
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

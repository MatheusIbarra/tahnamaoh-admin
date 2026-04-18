"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        "block rounded-md px-3 py-2 text-sm transition",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

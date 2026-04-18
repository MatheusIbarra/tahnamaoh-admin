import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo";
import { logoutAction } from "@/server/actions/auth/logout";
import { requireAdminSession } from "@/server/actions/auth/routeAccess";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/drivers", label: "Motoristas" },
  { href: "/clients", label: "Clientes" },
  { href: "/orders", label: "Pedidos" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-card px-4 py-6">
          <Link
            href="/dashboard"
            className="mb-8 block -mx-2 rounded-lg p-2 transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <BrandLogo priority heightClass="h-10" />
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Painel administrativo
            </p>
          </Link>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Sessão ativa</p>
            <p className="truncate text-sm font-medium text-foreground">{session.email}</p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="mt-3 w-full rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                Sair
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex items-center gap-3 border-b border-border px-6 py-4">
            <BrandLogo heightClass="h-8" className="opacity-90 lg:hidden" />
            <h1 className="text-lg font-semibold tracking-tight">Painel administrativo</h1>
          </header>
          <main className="space-y-6 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">TáhNaMão Admin</h1>
      <p className="text-sm text-slate-600">
        Painel administrativo em Next.js com Server Actions como proxy seguro para o core.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Entrar no painel
      </Link>
    </main>
  );
}

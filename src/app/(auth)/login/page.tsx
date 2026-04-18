import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo";
import { loginAction } from "@/server/actions/auth/login";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessageByCode: Record<string, string> = {
    invalid_credentials: "Credenciais inválidas.",
    core_unavailable: "Não foi possível autenticar no core agora. Tente novamente em instantes.",
    session_invalid: "Sessão inválida recebida do core. Tente novamente.",
    misconfigured:
      "Configuração incompleta no servidor (variáveis de ambiente). Verifique CORE_API_BASE_URL e ADMIN_SESSION_SECRET no .env do admin.",
    unexpected: "Erro inesperado ao autenticar.",
  };
  const errorMessage = params.error ? errorMessageByCode[params.error] : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-background to-muted/30 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandLogo priority heightClass="h-12" className="object-center" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-card-foreground">TáhNaMão Admin</h1>
            <p className="text-sm text-muted-foreground">
              Acesse o painel via sessão segura no servidor.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <form action={loginAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
              placeholder="admin@tahnamao.local"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">Autenticação dedicada via core.</p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-secondary hover:underline">
            Voltar para inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

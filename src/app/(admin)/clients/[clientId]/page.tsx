import Link from "next/link";

interface ClientDetailPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = await params;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Detalhe do Cliente</h2>
        <p className="text-sm text-muted-foreground">Cliente selecionado: {clientId}</p>
      </div>

      <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          A tela de detalhe pode ser expandida com os dados completos quando o endpoint dedicado do core
          estiver disponível.
        </p>
      </article>

      <Link href="/clients" className="inline-flex rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
        Voltar para listagem
      </Link>
    </section>
  );
}

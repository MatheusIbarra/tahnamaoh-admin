const KPI_ITEMS = [
  { label: "Motoristas em revisão", value: "--" },
  { label: "Clientes ativos", value: "--" },
  { label: "Pedidos hoje", value: "--" },
  { label: "SLA médio", value: "--" },
];

export default function DashboardPage() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          KPIs e gráficos serão alimentados por endpoints do core via Server Actions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_ITEMS.map((item) => (
          <article key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-card-foreground">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold">Gráficos</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Área reservada para visualizações de tendência operacional.
        </p>
      </article>
    </section>
  );
}

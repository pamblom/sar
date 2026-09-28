import Link from "next/link";
import { aprobarSolicitud } from "@/actions/pesajes";
import { DenyModal } from "@/components/deny-modal";
import { KpiCard, PageHead } from "@/components/brand";
import { dashboardMetrics, listSolicitudes, ranking } from "@/lib/sar";
import { formatKg, formatPts, fullName } from "@/lib/format";

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const metrics = await dashboardMetrics(30);
  const pendientes = await listSolicitudes({ estado: "Pendiente", q });
  const top = (await ranking()).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <PageHead
        kicker="Panel institucional"
        title="Dashboard"
        badge="Últimos 30 días"
        subtitle="Volumen acopiado, puntos, solicitudes pendientes y ranking operativo."
        icon="dashboard"
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Kilogramos procesados" value={formatKg(metrics.kilos)} icon="scale" hint="Ciclo operativo 30 días" />
        <KpiCard label="Puntos acreditados" value={formatPts(metrics.puntos)} icon="workspace_premium" hint="Tokens SAR del periodo" />
        <KpiCard label="Solicitudes pendientes" value={String(metrics.pendientes)} icon="inbox" badge="Fila de espera" />
        <KpiCard label="Recolectores activos" value={String(metrics.recolectores)} icon="groups" hint="Cuentas en estado activo" />
      </section>
      <form>
        <input name="q" defaultValue={q} className="field max-w-md" placeholder="Buscar por ID, nombre o código" />
      </form>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="kpi-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Solicitudes pendientes</h2>
            <Link href="/admin/solicitudes" className="text-sm text-tertiary">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {pendientes.length === 0 ? <p className="text-sm text-secondary">No hay solicitudes en espera.</p> : null}
            {pendientes.map((item) => (
              <article key={item.ID_Solicitud} className="rounded-xl bg-surface-low/80 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{item.Recolector}</p>
                    <p className="text-xs text-on-variant">
                      {item.Codigo} · {item.MaterialNombre} · {formatKg(item.Kilos)} · IA {item.IA_Fidelidad_Reconocimiento}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={aprobarSolicitud}>
                      <input type="hidden" name="id" value={item.ID_Solicitud} />
                      <button className="btn-mint min-h-11 rounded-lg px-3 text-sm">Aprobar</button>
                    </form>
                    <DenyModal id={item.ID_Solicitud} codigo={item.Codigo} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="kpi-card rounded-2xl p-5">
          <h2 className="mb-4 font-semibold text-white">Top recolectores</h2>
          <ol className="space-y-3">
            {top.map((item, index) => (
              <li key={item.ID_Usuario} className="flex justify-between text-sm">
                <span>
                  {index + 1}. {fullName(item.Nombres, item.Apellidos)}
                </span>
                <span className="font-semibold text-tertiary">{formatPts(item.Puntos_Acumulados)} pts</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

import { dashboardMetrics } from "@/lib/sar";
import { formatKg } from "@/lib/format";

export default async function AnaliticasPage() {
  const metrics = await dashboardMetrics(180);
  const maxMes = Math.max(...metrics.porMes.map((item) => Number(item.kilos)), 1);
  const maxMat = Math.max(...metrics.porMaterial.map((item) => Number(item.kilos)), 1);

  const csv = [
    "mes,kilos",
    ...metrics.porMes.map((item) => `${item.mes},${item.kilos}`),
    "",
    "material,kilos",
    ...metrics.porMaterial.map((item) => `${item.nombre},${item.kilos}`),
  ].join("\n");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label">P-06 · RF-10</p>
          <h1 className="text-3xl font-semibold">Analíticas</h1>
          <p className="mt-1 text-sm text-[#9cc4b8]">Proyección de los últimos 6 meses por tipo de material.</p>
        </div>
        <a
          className="btn-mint rounded-lg px-4 py-2 text-sm"
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download="sar-analiticas.csv"
        >
          Exportar informe
        </a>
      </div>
      <section className="kpi-card rounded-2xl p-5">
        <h2 className="font-semibold">Tendencia de kilogramos</h2>
        <div className="mt-4 flex h-48 items-end gap-3">
          {metrics.porMes.map((item) => (
            <div key={item.mes} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#2a6b5c] to-[#4ee0b8]"
                style={{ height: `${(Number(item.kilos) / maxMes) * 100}%` }}
              />
              <span className="text-[10px] uppercase text-[#9cc4b8]">{item.mes.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="kpi-card rounded-2xl p-5">
        <h2 className="font-semibold">Por material</h2>
        <ul className="mt-4 space-y-3">
          {metrics.porMaterial.map((item) => (
            <li key={item.nombre}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.nombre}</span>
                <span>{formatKg(Number(item.kilos))}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/30">
                <div className="h-full bg-[#4ee0b8]" style={{ width: `${(Number(item.kilos) / maxMat) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

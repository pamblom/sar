import { formatCo2, formatDate, formatKg, formatPts } from "@/lib/format";
import { listSolicitudes } from "@/lib/sar";

export default async function HistorialPage() {
  const rows = await listSolicitudes({ estado: "todas" });
  return (
    <div className="space-y-4">
      <div>
        <p className="label">RF-12</p>
        <h1 className="text-3xl font-semibold">Historial general</h1>
      </div>
      <div className="grid gap-3">
        {rows.map((item) => (
          <details key={item.ID_Solicitud} className="kpi-card rounded-2xl p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">
                  {item.Codigo} · {item.Recolector}
                </span>
                <span className="text-sm text-[#9cc4b8]">
                  {item.Estado} · {formatDate(item.Fecha_Creacion)}
                </span>
              </div>
            </summary>
            <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
              <div>Material: {item.MaterialNombre}</div>
              <div>Kilos: {formatKg(item.Kilos)}</div>
              <div>Puntos: {formatPts(item.PuntosEstimados)}</div>
              <div>Huella: {formatCo2(item.Huella)}</div>
              <div>Zona: {item.Zona}</div>
              <div>Báscula: {item.Bascula_Telemetria}</div>
              <div>Manifiesto: {item.Manifiesto}</div>
              <div>Motivo: {item.Motivo_Rechazo ?? "—"}</div>
            </dl>
          </details>
        ))}
      </div>
    </div>
  );
}

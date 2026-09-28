import { aprobarSolicitud } from "@/actions/pesajes";
import { DenyModal } from "@/components/deny-modal";
import { formatDate, formatKg, formatPts } from "@/lib/format";
import { listSolicitudes } from "@/lib/sar";

export default async function SolicitudesPage({ searchParams }: PageProps<"/admin/solicitudes">) {
  const params = await searchParams;
  const estado = typeof params.estado === "string" ? params.estado : "Pendiente";
  const q = typeof params.q === "string" ? params.q : "";
  const confianza = typeof params.confianza === "string" ? params.confianza : "";
  let rows = await listSolicitudes({ estado, q });
  if (confianza === "alta") rows = rows.filter((item) => Number(item.IA_Fidelidad_Reconocimiento) >= 85);
  if (confianza === "revisar") rows = rows.filter((item) => Number(item.IA_Fidelidad_Reconocimiento) < 85);

  return (
    <div className="space-y-4">
      <div>
        <p className="label">P-07 · RF-11</p>
        <h1 className="text-3xl font-semibold">Solicitudes de pesaje</h1>
      </div>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={q} className="field max-w-xs" placeholder="ID o recolector" />
        <select name="estado" defaultValue={estado} className="field max-w-40">
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Denegada">Denegada</option>
          <option value="todas">Todas</option>
        </select>
        <select name="confianza" defaultValue={confianza} className="field max-w-44">
          <option value="">Fila de espera</option>
          <option value="alta">Alta confianza</option>
          <option value="revisar">Por revisar</option>
        </select>
        <button className="rounded-lg bg-surface-high px-4">Filtrar</button>
      </form>
      <div className="kpi-card overflow-x-auto rounded-2xl">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[#9cc4b8]">
            <tr>
              {["Código", "Recolector", "IA", "Material", "Kilos", "Puntos", "Hora", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.ID_Solicitud} className="table-row border-t border-white/5">
                <td className="px-4 py-3">{item.Codigo}</td>
                <td className="px-4 py-3">
                  {item.Recolector}
                  <div className="text-xs text-[#9cc4b8]">Nivel {item.NivelRecolector}</div>
                </td>
                <td className="px-4 py-3">{item.IA_Fidelidad_Reconocimiento}%</td>
                <td className="px-4 py-3">{item.MaterialNombre}</td>
                <td className="px-4 py-3">{formatKg(item.Kilos)}</td>
                <td className="px-4 py-3">{formatPts(item.PuntosEstimados)}</td>
                <td className="px-4 py-3">{formatDate(item.Fecha_Creacion)}</td>
                <td className="px-4 py-3">
                  {item.Estado === "Pendiente" ? (
                    <div className="flex gap-2">
                      <form action={aprobarSolicitud}>
                        <input type="hidden" name="id" value={item.ID_Solicitud} />
                        <button className="btn-mint min-h-11 rounded-lg px-3">Aprobar</button>
                      </form>
                      <DenyModal id={item.ID_Solicitud} codigo={item.Codigo} />
                    </div>
                  ) : (
                    <span className="text-xs uppercase text-[#9cc4b8]">{item.Estado}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { Icon } from "@/components/brand";
import { requireUser } from "@/lib/auth";
import { formatCo2, formatDate, formatKg, formatPts } from "@/lib/format";
import { impactoRecolector, listSolicitudes } from "@/lib/sar";

export default async function HistorialRecolector({ searchParams }: PageProps<"/app/historial">) {
  const user = await requireUser(["Recolector"]);
  if (!user) redirect("/acceso?rol=Recolector");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const impacto = await impactoRecolector(user.ID_Usuario);
  const pesajes = await listSolicitudes({ recolectorId: user.ID_Usuario, q });
  const meta = Math.min(100, Math.round((Number(user.Puntos_Acumulados) / 4400) * 100));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface-container/80 p-3">
        <div>
          <p className="text-[11px] text-on-variant">Total acopiado</p>
          <p className="text-xl font-bold">{Math.round(impacto.kilos)} kg</p>
        </div>
        <div>
          <p className="text-[11px] text-on-variant">Puntos totales</p>
          <p className="text-xl font-bold text-tertiary">{formatPts(user.Puntos_Acumulados)} pts</p>
        </div>
        <div>
          <p className="text-[11px] text-on-variant">Pesajes</p>
          <p className="text-xl font-bold">{impacto.pesajes}</p>
        </div>
      </div>
      <div>
        <p className="mb-1 text-[11px] text-on-variant">Meta mensual: Nivel Eco-Master {meta}%</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-highest">
          <div className="h-full rounded-full bg-tertiary" style={{ width: `${meta}%` }} />
        </div>
      </div>
      <form>
        <input name="q" defaultValue={q} className="field" placeholder="Filtrar actividad" />
      </form>
      <ul className="space-y-2">
        {pesajes.map((item) => (
          <li key={item.ID_Solicitud} className="rounded-xl bg-surface-low/90 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-highest text-primary">
                  <Icon name="recycling" />
                </div>
                <div>
                  <p className="font-semibold">{item.MaterialNombre}</p>
                  <p className="text-[11px] text-on-variant">{formatDate(item.Fecha_Creacion)}</p>
                  <p className="mt-1 text-lg font-bold">{formatKg(item.Kilos)}</p>
                  <p className="text-[11px] text-secondary">Certificado #{item.Codigo}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${item.Estado === "Aprobada" ? "bg-emerald-500/15 text-tertiary" : "bg-white/5 text-on-variant"}`}>
                  {item.Estado === "Aprobada" ? "Aprobado" : item.Estado === "Pendiente" ? "En revisión" : "Denegado"}
                </span>
                <p className="mt-2 font-bold text-tertiary">+{formatPts(item.PuntosEstimados)} pts</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-surface-container p-4">
        <p className="flex items-center gap-2 font-semibold">
          <Icon name="eco" filled className="text-tertiary" />
          Impacto positivo certificado
        </p>
        <p className="mt-1 text-sm text-on-variant">Has evitado la emisión de aprox. {formatCo2(impacto.huella)} este mes.</p>
      </div>
    </div>
  );
}

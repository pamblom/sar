import { PageHead } from "@/components/brand";
import { formatPts, fullName, nivelDesdePuntos } from "@/lib/format";
import { ranking } from "@/lib/sar";

export default async function AdminRankingPage() {
  const rows = await ranking();
  return (
    <div className="flex flex-col gap-8">
      <PageHead
        kicker="Clasificación institucional"
        title="Ranking de Usuarios"
        badge="Q3 activo"
        subtitle="Puesto, rango SAR y puntos acumulados de la red de recolectores."
        icon="emoji_events"
      />
      <ol className="space-y-2">
        {rows.map((item, index) => (
          <li key={item.ID_Usuario} className="kpi-card flex items-center justify-between rounded-2xl px-4 py-3">
            <span className="flex items-center gap-3">
              <span className="w-8 text-lg font-bold text-tertiary">{index + 1}</span>
              <span>
                {fullName(item.Nombres, item.Apellidos)}
                <span className="ml-2 text-xs text-secondary">{nivelDesdePuntos(Number(item.Puntos_Acumulados)).nombre}</span>
              </span>
            </span>
            <span className="font-semibold text-white">{formatPts(item.Puntos_Acumulados)} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

import { redirect } from "next/navigation";
import { Icon } from "@/components/brand";
import { requireUser } from "@/lib/auth";
import { formatPts, fullName, nivelDesdePuntos, ZONAS } from "@/lib/format";
import { ranking } from "@/lib/sar";

export default async function RankingPage({ searchParams }: PageProps<"/app/ranking">) {
  const user = await requireUser(["Recolector"]);
  if (!user) redirect("/acceso?rol=Recolector");
  const params = await searchParams;
  const zona = typeof params.zona === "string" ? params.zona : "todas";
  const rows = await ranking({ zona, days: 3650 });
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const yo = rows.findIndex((item) => item.ID_Usuario === user.ID_Usuario) + 1;

  return (
    <div className="space-y-4">
      <form className="flex gap-2">
        <select name="zona" defaultValue={zona} className="field">
          <option value="todas">Todas las zonas</option>
          {ZONAS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button className="rounded-lg bg-surface-high px-3 text-sm">Filtrar</button>
      </form>
      <p className="text-xs text-on-variant">El top 3 se reinicia el día 1 de cada mes.</p>
      <section className="rounded-2xl bg-surface-container/80 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Icon name="workspace_premium" filled className="text-tertiary" />
            Podio de honor
          </h2>
          <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[11px] text-on-secondary-container">Q3 activo</span>
        </div>
        <div className="flex items-end justify-center gap-4">
          {[top[1], top[0], top[2]].filter(Boolean).map((person) => {
            const isFirst = person === top[0];
            return (
              <div key={person.ID_Usuario} className={`flex flex-col items-center ${isFirst ? "-mb-1" : "mt-4 opacity-90"}`}>
                <div className={`flex items-center justify-center rounded-full border border-tertiary/40 bg-primary-container text-sm font-bold ${isFirst ? "h-16 w-16" : "h-12 w-12"}`}>
                  {person.Nombres[0]}
                  {person.Apellidos[0]}
                </div>
                <p className="mt-2 text-center text-xs font-semibold">{person.Nombres}</p>
                <p className="text-[11px] text-tertiary">{formatPts(person.Puntos_Acumulados)} pts</p>
                <p className="text-[10px] text-on-variant">{nivelDesdePuntos(Number(person.Puntos_Acumulados)).nombre}</p>
              </div>
            );
          })}
        </div>
      </section>
      {yo > 0 ? (
        <div className="rounded-2xl bg-primary-container/25 p-4 text-sm">
          <p className="font-semibold text-tertiary">¡Estás en el puesto #{yo}!</p>
          <p className="text-on-variant">Mantén tu ritmo para asegurar el bono de reciclaje al cierre del ciclo.</p>
        </div>
      ) : null}
      <section>
        <div className="mb-2 flex justify-between text-sm">
          <h3 className="font-semibold">Clasificación general</h3>
          <span className="text-on-variant">Posiciones 4+</span>
        </div>
        <ol className="space-y-2">
          {rest.map((item, index) => (
            <li key={item.ID_Usuario} className="flex items-center justify-between rounded-xl bg-surface-low/90 px-3 py-2">
              <span className="flex items-center gap-3">
                <span className="w-5 text-sm text-on-variant">{index + 4}</span>
                <span>
                  {fullName(item.Nombres, item.Apellidos)}
                  <span className="block text-[11px] text-on-variant">
                    {nivelDesdePuntos(Number(item.Puntos_Acumulados)).nombre} · {item.Kilos} kg
                  </span>
                </span>
              </span>
              <span className="text-sm font-semibold">{formatPts(item.Puntos_Acumulados)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

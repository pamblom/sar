import { cambiarEstadoUsuario } from "@/actions/admin";
import { queryRows } from "@/lib/db";
import { listMateriales, listRecolectores, userMetrics } from "@/lib/sar";

type Extra = { id: number; kilos: number; material: string | null };

export default async function UsuariosPage({ searchParams }: PageProps<"/admin/usuarios">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const estado = typeof params.estado === "string" ? params.estado : "todos";
  const materialFiltro = typeof params.material === "string" ? params.material : "todos";

  const metrics = await userMetrics();
  const materiales = await listMateriales();
  const users = await listRecolectores();
  const extras = await queryRows<Extra>(
    `SELECT u.ID_Usuario AS id,
            COALESCE(SUM(CASE WHEN s.Estado = 'Aprobada' THEN s.Kilos ELSE 0 END), 0) AS kilos,
            (SELECT m.Nombre FROM Solicitudes_Pesaje s2
             JOIN Materiales m ON m.ID_Material = s2.ID_Material
             WHERE s2.ID_Recolector = u.ID_Usuario
             GROUP BY m.Nombre ORDER BY SUM(s2.Kilos) DESC LIMIT 1) AS material
     FROM Usuarios u
     LEFT JOIN Solicitudes_Pesaje s ON s.ID_Recolector = u.ID_Usuario
     WHERE u.Rol = 'Recolector'
     GROUP BY u.ID_Usuario`,
  );
  const extraOf = new Map(extras.map((item) => [Number(item.id), item]));
  const participacion = metrics.total ? ((metrics.activos / metrics.total) * 100).toFixed(1) : "0";
  const cop = (Number(metrics.puntos) * 100).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  const rows = users
    .slice()
    .sort((a, b) => Number(b.Puntos_Acumulados) - Number(a.Puntos_Acumulados))
    .filter((user) => {
      const extra = extraOf.get(Number(user.ID_Usuario));
      const text = `${user.ID_Usuario} ${user.Nombres} ${user.Apellidos} ${user.Numero_Documento ?? ""}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      if (estado !== "todos" && user.Estado_Cuenta !== estado) return false;
      if (materialFiltro !== "todos" && extra?.material !== materialFiltro) return false;
      return true;
    });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5 border-b border-primary/10 pb-6">
        <p className="text-[11px] font-semibold tracking-wider text-secondary/80 uppercase">Gestión de Recolectores</p>
        <div className="mt-1 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#123F36] to-[#2A6B5C] text-primary-fixed shadow-lg shadow-black/40">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
              Gestión de Recolectores
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-primary-fixed uppercase">
                Auditoría activa
              </span>
            </h1>
            <p className="mt-1 text-sm text-secondary/80">
              Supervisión de acreditación, pesaje certificado, rangos de recompensa y cumplimiento operativo institucional.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl p-5">
          <div className="pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-400/10 blur-xl" />
          <div className="flex items-start justify-between">
            <span className="max-w-32 text-sm font-semibold tracking-wider text-emerald-200/90 uppercase">Total recolectores</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-4xl font-extrabold tracking-tight text-white">{metrics.total}</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-200">
              + altas
            </span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-200/70">Censo actualizado en tiempo real</p>
        </article>
        <article className="kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <span className="max-w-32 text-sm font-semibold tracking-wider text-emerald-200/90 uppercase">Recolectores activos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-4xl font-extrabold tracking-tight text-white">{metrics.activos}</p>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
              {participacion}%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-200/70">{participacion}% de participación</p>
        </article>
        <article className="kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <span className="max-w-36 text-sm font-semibold tracking-wider text-emerald-200/90 uppercase">Material predominante</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">↻</div>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-2">
            <p className="text-3xl font-extrabold tracking-tight text-white">{metrics.predominante}</p>
          </div>
          <p className="mt-2 text-[11px] text-emerald-200/70">Mayor volumen recuperado este ciclo</p>
        </article>
        <article className="kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <span className="max-w-36 text-sm font-semibold tracking-wider text-emerald-200/90 uppercase">Puntos acreditados mes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">◉</div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-4xl font-extrabold tracking-tight text-white">{Number(metrics.puntos).toLocaleString("es-CO")}</p>
            <span className="rounded-md border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">En tokens</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-200/70">Equivalente a {cop} pagados</p>
        </article>
      </div>

      <form className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#2A6B5C]/40 bg-[#123F36]/80 p-5 text-emerald-100 shadow-xl lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] max-w-md flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>
            </span>
            <input name="q" defaultValue={q} className="w-full rounded-xl border border-emerald-600/25 bg-emerald-950/70 py-2 pr-4 pl-10 text-sm text-emerald-100 shadow-inner placeholder:text-emerald-200/50" placeholder="Buscar por ID, nombre o DNI..." />
          </div>
          <select name="estado" defaultValue={estado} className="min-w-40 appearance-none rounded-xl border border-emerald-600/25 bg-emerald-950/70 px-3.5 py-2 text-sm font-medium text-emerald-100">
            <option value="todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Suspendido">Suspendido</option>
            <option value="Bloqueado">Bloqueado</option>
            <option value="Vetado">Vetado</option>
          </select>
          <select name="material" defaultValue={materialFiltro} className="min-w-44 appearance-none rounded-xl border border-emerald-600/25 bg-emerald-950/70 px-3.5 py-2 text-sm font-medium text-emerald-100">
            <option value="todos">Todos los materiales</option>
            {materiales.map((item) => (
              <option key={item.ID_Material} value={item.Nombre}>
                {item.Nombre}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-emerald-950/70 px-3 py-2 text-sm text-emerald-200">Filtrar</button>
          <a href="/admin/usuarios" className="rounded-xl p-2 text-emerald-300 hover:bg-emerald-800/40" title="Restablecer filtros">
            ↺
          </a>
        </div>
        <a className="flex items-center gap-2 self-end rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-2 text-sm font-semibold text-emerald-200 lg:self-auto" href={`data:text/csv;charset=utf-8,${encodeURIComponent(["id,nombre,estado,puntos", ...rows.map((user) => `${user.ID_Usuario},${user.Nombres} ${user.Apellidos},${user.Estado_Cuenta},${user.Puntos_Acumulados}`)].join("\n"))}`} download="recolectores.csv">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
          Exportar CSV
        </a>
      </form>

      <div className="flex flex-col overflow-hidden rounded-3xl border border-[#2A6B5C]/40 bg-[#123F36]/80 text-emerald-100 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A6B5C]/40 px-6 py-4" style={{ background: "linear-gradient(135deg, rgba(42, 107, 92, 0.45) 0%, rgba(18, 63, 54, 0.6) 100%)" }}>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
            <span className="font-bold text-white">Listado general de operadores y recolectores</span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">{rows.length} enrolados</span>
          </div>
          <p className="text-[11px] text-emerald-200/80">
            Orden actual: <strong className="text-white">Puntos acumulados (descendente)</strong>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-emerald-700/30 bg-emerald-950/70 text-[11px] tracking-wider text-emerald-200/90 uppercase">
                <th className="w-24 px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Recolector / material principal</th>
                <th className="px-6 py-4 text-right font-semibold">Puntos acumulados</th>
                <th className="w-36 px-6 py-4 text-center font-semibold">Rango SAR</th>
                <th className="w-36 px-6 py-4 text-center font-semibold">Estado</th>
                <th className="w-44 px-6 py-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A6B5C]/15 text-sm">
              {rows.map((user, index) => {
                const extra = extraOf.get(Number(user.ID_Usuario));
                const initials = `${user.Nombres[0] ?? ""}${user.Apellidos[0] ?? ""}`;
                const doc = user.Numero_Documento ? `CC: ••••${user.Numero_Documento.slice(-4)}` : "";
                const rango = index === 0 ? "gold" : index === 1 ? "silver" : "plain";
                return (
                  <tr key={user.ID_Usuario} className="transition-colors hover:bg-emerald-800/40">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-300">#{user.ID_Usuario}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-gradient-to-tr from-[#123F36] to-[#2A6B5C] font-bold text-white">
                            {initials}
                          </div>
                          <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[#09221b] bg-emerald-400" />
                        </div>
                        <div>
                          <p className="truncate font-bold text-white">{user.Nombres} {user.Apellidos}</p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                              {extra?.material ?? "Sin material"}
                            </span>
                            <span className="text-[11px] text-emerald-200/70">{doc}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xl font-extrabold tracking-tight text-white">{Number(user.Puntos_Acumulados).toLocaleString("es-CO")} pts</p>
                      <p className="text-[11px] font-semibold text-emerald-300">{Number(extra?.kilos ?? 0).toLocaleString("es-CO")} kg entregados</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                          rango === "gold"
                            ? "border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/30 text-amber-300"
                            : rango === "silver"
                              ? "border border-slate-400/40 bg-gradient-to-r from-slate-300 to-gray-200 text-slate-800"
                              : "border border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                        }`}
                      >
                        Rango {user.Nivel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        {user.Estado_Cuenta}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <form action={cambiarEstadoUsuario}>
                          <input type="hidden" name="id" value={user.ID_Usuario} />
                          <input type="hidden" name="estado" value="Activo" />
                          <button className="rounded-xl p-2 text-emerald-300 hover:bg-emerald-800/50" title="Reactivar" aria-label="Reactivar">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                          </button>
                        </form>
                        <form action={cambiarEstadoUsuario}>
                          <input type="hidden" name="id" value={user.ID_Usuario} />
                          <input type="hidden" name="estado" value="Suspendido" />
                          <button className="rounded-xl p-2 text-amber-300 hover:bg-amber-500/20" title="Suspender operador" aria-label="Suspender">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="4.93" x2="19.07" y1="4.93" y2="19.07" /></svg>
                          </button>
                        </form>
                        <form action={cambiarEstadoUsuario}>
                          <input type="hidden" name="id" value={user.ID_Usuario} />
                          <input type="hidden" name="estado" value="Bloqueado" />
                          <button className="rounded-xl p-2 text-rose-300 hover:bg-rose-500/20" title="Bloquear usuario" aria-label="Bloquear">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="11" rx="2" width="18" x="3" y="11" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

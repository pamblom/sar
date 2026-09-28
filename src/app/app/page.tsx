import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/brand";
import { requireUser } from "@/lib/auth";
import { formatKg, formatPts, nivelDesdePuntos } from "@/lib/format";
import { impactoRecolector, listSolicitudes } from "@/lib/sar";

export default async function RecolectorHome() {
  const user = await requireUser(["Recolector"]);
  if (!user) redirect("/acceso?rol=Recolector");
  const nivel = nivelDesdePuntos(Number(user.Puntos_Acumulados));
  const impacto = await impactoRecolector(user.ID_Usuario);
  const recientes = (await listSolicitudes({ recolectorId: user.ID_Usuario })).slice(0, 3);
  const agua = Math.round(impacto.kilos * 0.34);
  const arboles = (impacto.kilos / 72).toFixed(1);
  const co2 = impacto.huella.toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-1 text-[28px] leading-9 font-semibold tracking-tight">
            Hola, {user.Nombres}
            <span className="text-tertiary">✦</span>
          </h1>
          <p className="truncate text-xs text-on-variant">Tu esfuerzo regenera el ecosistema urbano</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-surface-high/90 px-3 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary shadow-[0_0_8px_#4bddb5]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{nivel.nombre}</span>
        </div>
      </div>

      <div className="rounded-xl bg-surface-low/70 p-3 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-on-variant">
            <Icon name="eco" filled className="text-[16px] text-tertiary" />
            Próximo rango: <strong className="text-on-surface">{nivel.siguiente}</strong>
          </span>
          <span className="text-[11px] font-bold text-tertiary">{Math.round(nivel.progreso)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-highest/80 p-px">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-container via-tertiary to-primary shadow-[0_0_12px_rgba(75,221,181,0.5)]"
            style={{ width: `${nivel.progreso}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-on-variant">
          <span>
            {formatPts(user.Puntos_Acumulados)} / {formatPts(Number(user.Puntos_Acumulados) + nivel.faltan)} SAR exp
          </span>
          <span className="text-secondary">Faltan {formatPts(nivel.faltan)} pts</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-high/95 via-surface-container/90 to-surface-low/95 p-4">
        <div className="absolute top-0 right-0 h-36 w-36 bg-gradient-to-bl from-tertiary/20 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-highest/80 text-tertiary">
              <Icon name="token" filled className="text-[20px]" />
            </div>
            <span className="text-[13px] font-medium uppercase tracking-wide text-on-variant">Puntos actuales</span>
          </div>
          <span className="rounded-full bg-primary-container/40 px-2.5 py-1 text-[11px] text-on-primary-container">+ pts esta semana</span>
        </div>
        <p className="relative mt-4 bg-gradient-to-r from-white via-primary-fixed to-tertiary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          {formatPts(user.Puntos_Acumulados)} <span className="text-xl text-tertiary">PTS</span>
        </p>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-lowest/50 px-3 py-2 text-sm">
          <span className="flex items-center gap-2 text-on-variant">
            <Icon name="verified" className="text-[18px] text-secondary" />
            Valor canjeable: <strong className="text-on-surface">${(Number(user.Puntos_Acumulados) / 100).toFixed(2)}</strong>
          </span>
          <span className="text-[11px] font-semibold text-tertiary">Beneficios ›</span>
        </div>
      </div>

      <Link
        href="/app/pesaje"
        className="relative flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-tertiary-container via-[#043329] to-tertiary-container px-4 text-white shadow-[0_8px_30px_rgba(0,110,87,0.45)]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary/20 text-tertiary">
          <Icon name="qr_code_scanner" />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-lg font-bold tracking-tight uppercase">Nuevo pesaje</p>
          <p className="text-[11px] text-primary-fixed">Escanear código en báscula</p>
        </div>
        <Icon name="arrow_forward" className="ml-auto text-tertiary" />
      </Link>
      <p className="flex items-center justify-center gap-1 text-center text-[11px] text-on-variant">
        <Icon name="sensors" className="text-[14px] text-outline" />
        Apunta al código QR del centro de acopio o báscula certificada
      </p>

      <section className="rounded-2xl bg-surface-container/90 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Icon name="nest_eco_leaf" filled className="text-primary text-[20px]" />
            Tu impacto hoy
          </h2>
          <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-medium text-on-secondary-container">Ciclo activo</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: "water_drop", value: `${agua} L`, label: "Agua ahorrada" },
            { icon: "forest", value: arboles, label: "Árboles protegidos" },
            { icon: "cloud_done", value: `-${co2} kg`, label: "Huella CO₂" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center rounded-xl bg-surface-low/90 p-3 text-center">
              <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface-high text-secondary">
                <Icon name={item.icon} className="text-[18px]" />
              </div>
              <span className="text-xl font-bold">{item.value}</span>
              <span className="mt-0.5 text-[11px] leading-tight text-on-variant">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-primary-container/20 p-2.5 text-on-primary-container">
          <Icon name="workspace_premium" className="shrink-0 text-[18px] text-primary" />
          <p className="text-xs leading-tight">
            Has evitado que <strong>{formatKg(impacto.kilos)}</strong> de desechos alcancen rellenos sanitarios.
          </p>
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Actividad reciente</h3>
          <Link href="/app/historial" className="text-[11px] text-secondary">
            Ver todo ›
          </Link>
        </div>
        {recientes.map((item) => (
          <article key={item.ID_Solicitud} className="flex items-center justify-between rounded-xl bg-surface-low/90 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-highest text-tertiary">
                <Icon name="recycling" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {item.MaterialNombre}{" "}
                  <span className="rounded bg-surface-highest px-1.5 text-[11px] font-medium text-secondary">{formatKg(item.Kilos)}</span>
                </p>
                <p className="truncate text-[11px] text-on-variant">
                  {item.Zona} · {item.Codigo}
                </p>
              </div>
            </div>
            <div className="pl-2 text-right">
              <p className="font-bold text-tertiary">+{formatPts(item.PuntosEstimados)} pts</p>
              <p className="text-[11px] font-medium text-secondary">{item.Estado}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-surface-high/90 to-surface-highest/80 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container/30 text-tertiary">
          <Icon name="military_tech" filled className="text-[28px]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold">Reto semanal acopio</p>
            <span className="rounded bg-tertiary-container px-1.5 py-0.5 text-[11px] font-semibold text-on-tertiary-container">Activo</span>
          </div>
          <p className="mt-0.5 text-xs text-on-variant">Recicla 5 kg de aluminio para obtener +300 pts extra.</p>
        </div>
      </div>
    </div>
  );
}

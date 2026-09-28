"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { Icon, SarMark } from "@/components/brand";
import { SAR_SIDEBAR_BG } from "@/lib/brand";

const links = [
  { href: "/admin", label: "Dashboard", icon: "grid_view" },
  { href: "/admin/analiticas", label: "Analíticas", icon: "show_chart" },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: "inbox", badge: true },
  { href: "/admin/historial", label: "Historial", icon: "schedule" },
  { href: "/admin/ranking", label: "Ranking de Usuarios", icon: "emoji_events" },
  { href: "/admin/usuarios", label: "Gestión de Usuarios", icon: "group" },
  { href: "/admin/materiales", label: "Materiales", icon: "inventory_2" },
  { href: "/admin/perfil", label: "Reporte Ambiental", icon: "spa" },
];

export function AdminSidebar({
  name,
  pendientes,
}: {
  name: string;
  pendientes: number;
}) {
  const path = usePathname();
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="relative hidden h-screen w-64 shrink-0 overflow-hidden border-r border-emerald-700/40 lg:flex lg:w-72">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={SAR_SIDEBAR_BG} className="h-full w-full scale-105 object-cover object-left opacity-35 brightness-75 saturate-150" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081b16]/95 via-[#0b241e]/90 to-[#04110e]/98" />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div>
          <div className="mb-6 flex items-center gap-3.5 px-2 py-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-200 p-[1.5px]">
              <SarMark size={37} />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xl font-bold tracking-wider text-white">
                SAR
                <span className="rounded border border-emerald-400/30 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] tracking-widest text-emerald-300">
                  QUANTUM
                </span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-emerald-400/80">Enterprise OS</p>
            </div>
          </div>
          <nav className="space-y-1.5 px-1 text-sm">
            {links.map((link) => {
              const active = path === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2.5 transition-all ${
                    active ? "glass-nav-active text-white" : "border border-transparent text-emerald-200/80 hover:bg-emerald-800/40 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon name={link.icon} className="text-[18px] text-emerald-300" />
                    {link.label}
                  </span>
                  {link.badge && pendientes > 0 ? (
                    <span className="rounded-md border border-emerald-400/20 bg-emerald-500/25 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      {pendientes}
                    </span>
                  ) : active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#4ade80]" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-emerald-700/30 pt-4">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-600/25 bg-emerald-950/70 p-2.5">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-800 text-xs font-bold text-emerald-200">
                {initials}
              </div>
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#09221b] bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{name}</p>
              <p className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-emerald-400/90">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Nivel IV • Cuántico
              </p>
            </div>
            <form action={logoutAction}>
              <button className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-800/50" aria-label="Cerrar sesión">
                <Icon name="logout" className="text-[16px]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}

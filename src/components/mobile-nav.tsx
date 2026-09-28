"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, SarMark } from "@/components/brand";

const tabs = [
  { href: "/app", label: "Inicio", icon: "home" },
  { href: "/app/historial", label: "Historial", icon: "receipt_long" },
  { href: "/app/ranking", label: "Ranking", icon: "trophy" },
  { href: "/app/perfil", label: "Perfil", icon: "person" },
];

export function MobileHeader() {
  const path = usePathname();
  const subtitle = path.includes("historial")
    ? "Historial"
    : path.includes("ranking")
      ? "Ranking"
      : path.includes("perfil")
        ? "Perfil"
        : path.includes("pesaje")
          ? "Nuevo pesaje"
          : "Inicio";
  return (
    <header className="sticky top-0 z-50 bg-surface-low/80 px-4 pt-2 shadow-[0_1px_8px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <SarMark size={32} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-semibold tracking-tight text-primary">SAR</span>
              <span className="rounded-full bg-secondary-container px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-secondary-container">
                Mobile
              </span>
            </div>
            <p className="text-[11px] text-on-variant">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="relative flex h-11 w-11 items-center justify-center rounded-full text-on-variant" aria-label="Notificaciones">
            <Icon name="notifications" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-tertiary shadow-[0_0_8px_#4bddb5]" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="person" className="text-[18px]" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-low/85 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {tabs.map((tab) => {
          const active = tab.href === "/app" ? path === "/app" : path.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-12 w-16 min-w-11 flex-col items-center justify-center gap-0.5 ${active ? "font-semibold text-tertiary" : "text-on-variant"}`}
            >
              <Icon name={tab.icon} filled={active} />
              <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { redirect } from "next/navigation";
import { MobileHeader, MobileNav } from "@/components/mobile-nav";
import { requireUser } from "@/lib/auth";
import { SAR_FOLIAGE } from "@/lib/brand";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["Recolector"]);
  if (!user) redirect("/acceso?rol=Recolector");

  return (
    <div className="relative mx-auto min-h-full max-w-md overflow-x-hidden bg-surface text-on-surface">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 mix-blend-screen"
        style={{ backgroundImage: `url('${SAR_FOLIAGE}')` }}
      />
      <div className="pointer-events-none absolute -top-24 -left-20 -z-10 h-64 w-64 rounded-full bg-tertiary-container/30 blur-[90px]" />
      <MobileHeader />
      <div className="px-4 pb-28 pt-3">{children}</div>
      <MobileNav />
    </div>
  );
}

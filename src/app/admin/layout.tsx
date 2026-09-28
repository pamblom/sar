import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-nav";
import { requireUser } from "@/lib/auth";
import { dashboardMetrics } from "@/lib/sar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["Admin"]);
  if (!user) redirect("/acceso?rol=Admin");
  const metrics = await dashboardMetrics(30);

  return (
    <div className="flex h-screen overflow-hidden bg-[#071613] text-[#f2f7f4]">
      <AdminSidebar name={`${user.Nombres} ${user.Apellidos}`} pendientes={metrics.pendientes} />
      <main
        className="min-w-0 flex-1 overflow-y-auto"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(18, 63, 54, 0.65) 0%, rgba(8, 22, 19, 0.92) 75%), rgb(7, 22, 19)",
        }}
      >
        <div className="relative mx-auto w-full max-w-[1600px] p-6 lg:p-10">
          <div className="pointer-events-none absolute -top-12 right-12 h-96 w-96 rounded-full bg-primary-container/20 blur-[110px]" />
          {children}
        </div>
      </main>
    </div>
  );
}

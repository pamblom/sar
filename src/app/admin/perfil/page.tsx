import { PerfilForm } from "@/components/perfil-form";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { auditLog } from "@/lib/sar";
import { redirect } from "next/navigation";

export default async function PerfilPage() {
  const user = await requireUser(["Admin"]);
  if (!user) redirect("/acceso?rol=Admin");
  const events = await auditLog(user.ID_Usuario);

  return (
    <div className="space-y-6">
      <div>
        <p className="label">P-10 · RF-09</p>
        <h1 className="text-3xl font-semibold">Perfil y configuración</h1>
        <p className="text-sm text-[#9cc4b8]">Código admin {user.Codigo_Admin} · PIN de respaldo {user.PIN_Respaldo}</p>
      </div>
      <PerfilForm user={user} />
      <section className="kpi-card max-w-xl rounded-2xl p-5">
        <h2 className="font-semibold">Auditoría de sesión</h2>
        <ul className="mt-3 space-y-2 text-sm text-[#9cc4b8]">
          {events.map((event) => (
            <li key={event.ID_Evento}>
              {formatDate(event.Fecha)} · {event.Accion} {event.Detalle ? `· ${event.Detalle}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

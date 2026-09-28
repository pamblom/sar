import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { PerfilForm } from "@/components/perfil-form";
import { requireUser } from "@/lib/auth";
import { formatPts, nivelDesdePuntos } from "@/lib/format";

export default async function PerfilRecolector() {
  const user = await requireUser(["Recolector"]);
  if (!user) redirect("/acceso?rol=Recolector");
  const nivel = nivelDesdePuntos(Number(user.Puntos_Acumulados));
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface-container p-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-on-primary">
          {user.Nombres[0]}
          {user.Apellidos[0]}
        </div>
        <h1 className="mt-3 text-xl font-semibold">
          {user.Nombres} {user.Apellidos}
        </h1>
        <p className="text-sm text-tertiary">
          {nivel.nombre} · {formatPts(user.Puntos_Acumulados)} pts
        </p>
      </div>
      <PerfilForm user={user} />
      <form action={logoutAction}>
        <button className="w-full rounded-xl bg-surface-high py-3 text-sm text-on-variant">Cerrar sesión</button>
      </form>
    </div>
  );
}

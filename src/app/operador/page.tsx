import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { OperadorForm } from "@/components/operador-form";
import { PageHead, SarMark } from "@/components/brand";
import { requireUser } from "@/lib/auth";
import { formatDate, formatKg } from "@/lib/format";
import { listMateriales, listRecolectores, listSolicitudes } from "@/lib/sar";

export default async function OperadorPage() {
  const user = await requireUser(["Operador", "Admin"]);
  if (!user) redirect("/acceso?rol=Operador");
  const recolectores = await listRecolectores();
  const materiales = await listMateriales(true);
  const recientes = (await listSolicitudes()).slice(0, 8);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SarMark size={40} />
          <div>
            <p className="font-bold tracking-wider">SAR Acopio</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">Operador</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="text-sm text-on-variant">Salir</button>
        </form>
      </header>
      <PageHead
        title="Recepción en acopio"
        subtitle={`${user.Nombres} ${user.Apellidos} · ${user.Lugar_Acopio}`}
        icon="precision_manufacturing"
      />
      <OperadorForm recolectores={recolectores} materiales={materiales} />
      <section className="kpi-card rounded-2xl p-4">
        <h2 className="mb-3 font-semibold">Últimos registros</h2>
        <ul className="space-y-2 text-sm">
          {recientes.map((item) => (
            <li key={item.ID_Solicitud} className="flex justify-between gap-3">
              <span>
                {item.Codigo} · {item.Recolector} · {item.MaterialNombre}
              </span>
              <span className="text-on-variant">
                {formatKg(item.Kilos)} · {item.Estado} · {formatDate(item.Fecha_Creacion)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

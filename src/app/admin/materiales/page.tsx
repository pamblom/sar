import { eliminarMaterial } from "@/actions/admin";
import { MaterialForm } from "@/components/material-form";
import { PageHead } from "@/components/brand";
import { formatCo2 } from "@/lib/format";
import { dashboardMetrics, listMateriales, listSolicitudes } from "@/lib/sar";

export default async function MaterialesPage() {
  const materiales = await listMateriales();
  const metrics = await dashboardMetrics(365);
  const solicitudes = await listSolicitudes({ estado: "Aprobada" });

  const csvMateriales = [
    "nombre,categoria,co2_por_kg,puntos_por_kg,estado",
    ...materiales.map((item) => [item.Nombre, item.Categoria, item.Impacto_Huella_Carbono, item.Puntos_por_Kg, item.Estado].join(",")),
  ].join("\n");

  const csvManifiesto = [
    "codigo,recolector,material,kilos,huella,zona,fecha",
    ...solicitudes.map((item) =>
      [item.Codigo, item.Recolector, item.MaterialNombre, item.Kilos, item.Huella, item.Zona, item.Fecha_Creacion].join(","),
    ),
  ].join("\n");

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Matriz IA"
        title="Materiales y reportes"
        badge="Huella activa"
        subtitle={`Huella acumulada: ${formatCo2(metrics.huella)}`}
        icon="inventory_2"
      />
      <div className="flex flex-wrap gap-2">
        <a className="btn-mint rounded-lg px-4 py-2 text-sm" href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvMateriales)}`} download="matriz-materiales.csv">
          Exportar matriz IA
        </a>
        <a className="rounded-lg bg-surface-high px-4 py-2 text-sm" href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvManifiesto)}`} download="manifiesto-trazabilidad.csv">
          Manifiesto CSV
        </a>
        <a className="rounded-lg bg-surface-high px-4 py-2 text-sm" href={`data:text/csv;charset=utf-8,${encodeURIComponent(`huella_kg_co2,${metrics.huella}`)}`} download="huella-carbono.csv">
          Huella de carbono
        </a>
      </div>
      <MaterialForm />
      <div className="space-y-3">
        {materiales.map((item) => (
          <article key={item.ID_Material} className="kpi-card rounded-2xl p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">{item.Nombre}</h2>
                <p className="text-sm text-[#9cc4b8]">
                  {item.Categoria} · {item.Puntos_por_Kg} pts/kg · {item.Estado}
                </p>
              </div>
              <form action={eliminarMaterial}>
                <input type="hidden" name="id" value={item.ID_Material} />
                <button className="text-sm text-[#ffb4ab]">Desactivar</button>
              </form>
            </div>
            <MaterialForm material={item} />
          </article>
        ))}
      </div>
    </div>
  );
}

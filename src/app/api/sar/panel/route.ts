import { execute } from "@/lib/db";
import { acreditarPuntos, dashboardMetrics, getSolicitud, listMateriales, listSolicitudes, notify, ranking } from "@/lib/sar";

export async function GET() {
  const [metrics, solicitudes, materiales, tabla] = await Promise.all([
    dashboardMetrics(180),
    listSolicitudes({ estado: "todas" }),
    listMateriales(),
    ranking(),
  ]);
  return Response.json({ metrics, solicitudes, materiales, ranking: tabla });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    accion?: string;
    id?: number;
    motivo?: string;
    nombre?: string;
    categoria?: string;
    co2?: number;
    puntos?: number;
  };

  if (body.accion === "aprobar" || body.accion === "denegar") {
    const solicitud = await getSolicitud(Number(body.id));
    if (!solicitud || solicitud.Estado !== "Pendiente") {
      return Response.json({ error: "La solicitud ya fue resuelta." }, { status: 400 });
    }
    if (body.accion === "aprobar") {
      await execute(
        "UPDATE Solicitudes_Pesaje SET Estado = 'Aprobada', Fecha_Validacion = datetime('now') WHERE ID_Solicitud = ?",
        [solicitud.ID_Solicitud],
      );
      await acreditarPuntos(Number(solicitud.ID_Recolector), solicitud.ID_Solicitud, Number(solicitud.PuntosEstimados));
      await notify(
        Number(solicitud.ID_Recolector),
        "Pesaje aprobado",
        `${solicitud.Codigo}: +${solicitud.PuntosEstimados} pts por ${solicitud.MaterialNombre}.`,
      );
    } else {
      const motivo = String(body.motivo || "Material no válido");
      await execute(
        "UPDATE Solicitudes_Pesaje SET Estado = 'Denegada', Motivo_Rechazo = ?, Fecha_Validacion = datetime('now') WHERE ID_Solicitud = ?",
        [motivo, solicitud.ID_Solicitud],
      );
      await notify(Number(solicitud.ID_Recolector), "Pesaje denegado", `${solicitud.Codigo}: ${motivo}.`);
    }
    return Response.json({ ok: true });
  }

  if (body.accion === "material") {
    const nombre = String(body.nombre || "").trim();
    const categoria = String(body.categoria || "").trim();
    if (!nombre || !categoria) return Response.json({ error: "Nombre y categoría son obligatorios." }, { status: 400 });
    await execute(
      "INSERT INTO Materiales (Nombre, Categoria, Impacto_Huella_Carbono, Puntos_por_Kg, Estado) VALUES (?, ?, ?, ?, 'Activo')",
      [nombre, categoria, Number(body.co2) || 0, Number(body.puntos) || 0],
    );
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Acción no reconocida." }, { status: 400 });
}

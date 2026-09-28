import { getCurrentUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import { listMateriales, nextSolicitudCodigo } from "@/lib/sar";
import { reconocerMaterial, telemetriaBascula } from "@/lib/ia";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.Rol !== "Recolector") {
    return Response.json({ error: "Inicia sesión como recolector." }, { status: 401 });
  }
  const body = (await request.json()) as { kilos?: number; material?: string };
  const kilos = Number(body.kilos);
  if (!kilos || kilos <= 0) return Response.json({ error: "Indica los kilos." }, { status: 400 });
  const materiales = await listMateriales(true);
  const guess = reconocerMaterial(String(body.material || "pet"), materiales);
  const material = guess.material || materiales[0];
  if (!material) return Response.json({ error: "No hay materiales." }, { status: 400 });
  const codigo = await nextSolicitudCodigo();
  await execute(
    `INSERT INTO Solicitudes_Pesaje
      (Codigo, ID_Recolector, ID_Material, Kilos, IA_Fidelidad_Reconocimiento, Bascula_Telemetria, Estado, Zona, Manifiesto)
     VALUES (?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?)`,
    [
      codigo,
      user.ID_Usuario,
      material.ID_Material,
      kilos,
      guess.fidelidad,
      telemetriaBascula(user.Zona || "Centro", kilos),
      user.Zona || "Centro",
      `MAN-${codigo}`,
    ],
  );
  const puntos = Number((kilos * Number(material.Puntos_por_Kg)).toFixed(2));
  return Response.json({ codigo, material: material.Nombre, kilos, puntos, fidelidad: guess.fidelidad });
}

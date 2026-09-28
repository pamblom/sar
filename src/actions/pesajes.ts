"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { execute, queryOne } from "@/lib/db";
import { reconocerMaterial, telemetriaBascula } from "@/lib/ia";
import { acreditarPuntos, listMateriales, nextSolicitudCodigo, notify } from "@/lib/sar";
import type { Material, Usuario } from "@/lib/types";

export type ActionState = { error?: string; ok?: string };

type SolicitudVistaJoin = {
  ID_Solicitud: number;
  Codigo: string;
  ID_Recolector: number;
  Estado: string;
  PuntosEstimados: number;
  MaterialNombre: string;
};

async function savePhoto(file: File | null) {
  if (!file || file.size === 0) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 1_500_000) {
    return `data:${file.type};base64,${bytes.subarray(0, 1_200_000).toString("base64")}`;
  }
  return `data:${file.type || "image/jpeg"};base64,${bytes.toString("base64")}`;
}

export async function crearPesajeRecolector(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["Recolector"]);
  if (!user) return { error: "Sesión no válida." };

  const kilos = Number(formData.get("kilos"));
  const materialId = Number(formData.get("material_id"));
  const foto = formData.get("foto");
  if (!kilos || kilos <= 0) return { error: "Ingresa los kilos pesados en báscula." };

  const materiales = await listMateriales(true);
  const file = foto instanceof File ? foto : null;
  const ia = reconocerMaterial(file?.name || `manual-${materialId}`, materiales);
  const material =
    materiales.find((item) => item.ID_Material === materialId) ?? ia.material ?? materiales[0];
  if (!material) return { error: "No hay materiales activos." };

  const codigo = await nextSolicitudCodigo();
  const fotoUrl = await savePhoto(file);
  await execute(
    `INSERT INTO Solicitudes_Pesaje
      (Codigo, ID_Recolector, ID_Material, Kilos, Foto_URL, IA_Fidelidad_Reconocimiento, Bascula_Telemetria, Estado, Zona, Manifiesto)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?)`,
    [
      codigo,
      user.ID_Usuario,
      material.ID_Material,
      kilos,
      fotoUrl,
      ia.fidelidad,
      telemetriaBascula(user.Zona || "Centro", kilos),
      user.Zona || "Centro",
      `MAN-${codigo}`,
    ],
  );
  await notify(user.ID_Usuario, "Solicitud enviada", `${codigo} quedó en espera de validación del administrador.`);
  revalidatePath("/app");
  revalidatePath("/admin");
  return { ok: `Solicitud ${codigo} enviada. Fidelidad IA ${ia.fidelidad}%.` };
}

export async function registrarEntregaOperador(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const operador = await requireUser(["Operador", "Admin"]);
  if (!operador) return { error: "Sesión no válida." };

  const recolectorId = Number(formData.get("recolector_id"));
  const materialId = Number(formData.get("material_id"));
  const kilos = Number(formData.get("kilos"));
  const valido = String(formData.get("valido") || "si");
  const motivo = String(formData.get("motivo") || "").trim();

  if (!recolectorId || !materialId || !kilos || kilos <= 0) {
    return { error: "Selecciona recolector, material y kilos." };
  }

  const recolector = await queryOne<Usuario>("SELECT * FROM Usuarios WHERE ID_Usuario = ? AND Rol = 'Recolector'", [
    recolectorId,
  ]);
  const material = await queryOne<Material>("SELECT * FROM Materiales WHERE ID_Material = ?", [materialId]);
  if (!recolector || !material) return { error: "Recolector o material no encontrado." };

  const codigo = await nextSolicitudCodigo();
  const estado = valido === "si" ? "Aprobada" : "Denegada";
  const { insertId } = await execute(
    `INSERT INTO Solicitudes_Pesaje
      (Codigo, ID_Recolector, ID_Material, ID_Operador, Kilos, IA_Fidelidad_Reconocimiento, Bascula_Telemetria, Estado, Motivo_Rechazo, Zona, Manifiesto, Fecha_Validacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      codigo,
      recolectorId,
      materialId,
      operador.ID_Usuario,
      kilos,
      100,
      telemetriaBascula(operador.Zona || "Manga", kilos),
      estado,
      estado === "Denegada" ? motivo || "Material no válido" : null,
      recolector.Zona || operador.Zona || "Centro",
      `MAN-${codigo}`,
    ],
  );

  if (estado === "Aprobada") {
    const puntos = Number((kilos * Number(material.Puntos_por_Kg)).toFixed(2));
    await acreditarPuntos(recolectorId, insertId, puntos);
    await notify(recolectorId, "Puntos acreditados", `${codigo}: +${puntos} pts por ${kilos} kg de ${material.Nombre}.`);
  } else {
    await notify(recolectorId, "Entrega rechazada", `${codigo}: ${motivo || "Material no válido"}.`);
  }

  revalidatePath("/operador");
  revalidatePath("/admin");
  return { ok: estado === "Aprobada" ? `Entrega ${codigo} confirmada y puntos asignados.` : `Entrega ${codigo} rechazada.` };
}

export async function aprobarSolicitud(formData: FormData) {
  const admin = await requireUser(["Admin"]);
  if (!admin) return;
  const id = Number(formData.get("id"));
  const solicitud = await queryOne<SolicitudVistaJoin>(
    `SELECT s.*, ROUND(s.Kilos * m.Puntos_por_Kg, 2) AS PuntosEstimados, m.Nombre AS MaterialNombre
     FROM Solicitudes_Pesaje s JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE s.ID_Solicitud = ?`,
    [id],
  );
  if (!solicitud || solicitud.Estado !== "Pendiente") return;

  await execute(
    "UPDATE Solicitudes_Pesaje SET Estado = 'Aprobada', ID_Operador = ?, Fecha_Validacion = datetime('now') WHERE ID_Solicitud = ?",
    [admin.ID_Usuario, id],
  );
  await acreditarPuntos(Number(solicitud.ID_Recolector), id, Number(solicitud.PuntosEstimados));
  await notify(
    Number(solicitud.ID_Recolector),
    "Pesaje aprobado",
    `${solicitud.Codigo}: +${solicitud.PuntosEstimados} pts por ${solicitud.MaterialNombre}.`,
  );
  revalidatePath("/admin");
  revalidatePath("/app");
}

export async function denegarSolicitud(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser(["Admin"]);
  if (!admin) return { error: "Sesión no válida." };
  const id = Number(formData.get("id"));
  const motivo = String(formData.get("motivo") || "").trim();
  const comentario = String(formData.get("comentario") || "").trim();
  if (!motivo || !comentario) return { error: "El motivo y el comentario son obligatorios." };

  const solicitud = await queryOne<{ ID_Recolector: number; Codigo: string; Estado: string }>(
    "SELECT ID_Recolector, Codigo, Estado FROM Solicitudes_Pesaje WHERE ID_Solicitud = ?",
    [id],
  );
  if (!solicitud || solicitud.Estado !== "Pendiente") return { error: "La solicitud ya fue resuelta." };

  await execute(
    `UPDATE Solicitudes_Pesaje
     SET Estado = 'Denegada', Motivo_Rechazo = ?, Comentario_Rechazo = ?, ID_Operador = ?, Fecha_Validacion = datetime('now')
     WHERE ID_Solicitud = ?`,
    [motivo, comentario, admin.ID_Usuario, id],
  );
  await notify(solicitud.ID_Recolector, "Pesaje denegado", `${solicitud.Codigo}: ${motivo}. ${comentario}`);
  revalidatePath("/admin");
  revalidatePath("/app");
  return { ok: "Solicitud denegada y recolector notificado." };
}

"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { logAudit, requireUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import type { EstadoCuenta } from "@/lib/types";

export type ActionState = { error?: string; ok?: string };

export async function cambiarEstadoUsuario(formData: FormData) {
  const admin = await requireUser(["Admin"]);
  if (!admin) return;
  const id = Number(formData.get("id"));
  const estado = String(formData.get("estado")) as EstadoCuenta;
  if (!["Activo", "Bloqueado", "Suspendido", "Vetado"].includes(estado)) return;
  await execute("UPDATE Usuarios SET Estado_Cuenta = ? WHERE ID_Usuario = ? AND Rol = 'Recolector'", [estado, id]);
  await logAudit(admin.ID_Usuario, "Gestión de usuario", `Usuario ${id} → ${estado}`);
  revalidatePath("/admin/usuarios");
}

export async function guardarMaterial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser(["Admin"]);
  if (!admin) return { error: "Sin permiso." };
  const id = Number(formData.get("id") || 0);
  const nombre = String(formData.get("nombre") || "").trim();
  const categoria = String(formData.get("categoria") || "").trim();
  const co2 = Number(formData.get("co2"));
  const puntos = Number(formData.get("puntos"));
  const estado = String(formData.get("estado") || "Activo");
  if (!nombre || !categoria || !(co2 >= 0) || !(puntos >= 0)) return { error: "Completa el material." };

  if (id) {
    await execute(
      "UPDATE Materiales SET Nombre = ?, Categoria = ?, Impacto_Huella_Carbono = ?, Puntos_por_Kg = ?, Estado = ? WHERE ID_Material = ?",
      [nombre, categoria, co2, puntos, estado, id],
    );
  } else {
    await execute(
      "INSERT INTO Materiales (Nombre, Categoria, Impacto_Huella_Carbono, Puntos_por_Kg, Estado) VALUES (?, ?, ?, ?, ?)",
      [nombre, categoria, co2, puntos, estado],
    );
  }
  revalidatePath("/admin/materiales");
  return { ok: "Material actualizado en la matriz de IA." };
}

export async function eliminarMaterial(formData: FormData) {
  const admin = await requireUser(["Admin"]);
  if (!admin) return;
  const id = Number(formData.get("id"));
  await execute("UPDATE Materiales SET Estado = 'Inactivo' WHERE ID_Material = ?", [id]);
  revalidatePath("/admin/materiales");
}

export async function guardarPerfil(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Sesión no válida." };
  const nombres = String(formData.get("nombres") || "").trim();
  const apellidos = String(formData.get("apellidos") || "").trim();
  const lugar = String(formData.get("lugar") || user.Lugar_Acopio || "");
  const zona = String(formData.get("zona") || user.Zona || "Centro");
  const two = formData.get("two_factor") ? 1 : 0;
  const alertas = formData.get("alertas") ? 1 : 0;
  const tema = String(formData.get("tema") || "esmeralda");
  const password = String(formData.get("password") || "");

  if (password) {
    await execute(
      `UPDATE Usuarios SET Nombres = ?, Apellidos = ?, Lugar_Acopio = ?, Zona = ?, Two_Factor = ?, Alertas_Sonoras = ?, Tema = ?, Password_Hash = ?
       WHERE ID_Usuario = ?`,
      [nombres, apellidos, lugar, zona, two, alertas, tema, await hash(password, 10), user.ID_Usuario],
    );
  } else {
    await execute(
      `UPDATE Usuarios SET Nombres = ?, Apellidos = ?, Lugar_Acopio = ?, Zona = ?, Two_Factor = ?, Alertas_Sonoras = ?, Tema = ?
       WHERE ID_Usuario = ?`,
      [nombres, apellidos, lugar, zona, two, alertas, tema, user.ID_Usuario],
    );
  }
  await logAudit(user.ID_Usuario, "Actualización de perfil");
  revalidatePath("/admin/perfil");
  revalidatePath("/app");
  return { ok: "Cambios guardados." };
}

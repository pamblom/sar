"use server";

import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { createSession, destroySession, getCurrentUser, homeForRole, logAudit, verifyPassword } from "@/lib/auth";
import { execute, queryOne } from "@/lib/db";
import { passwordStrength } from "@/lib/format";
import type { Usuario } from "@/lib/types";

export type AuthState = { error?: string; ok?: string };

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const codigoAdmin = String(formData.get("codigo_admin") || "").trim();
  const pin = String(formData.get("pin") || "").trim();
  const rolEsperado = String(formData.get("rol") || "");

  const user = await queryOne<Usuario>("SELECT * FROM Usuarios WHERE lower(Correo) = ?", [correo]);
  if (!user || !(await verifyPassword(password, user.Password_Hash))) {
    return { error: "Correo o contraseña incorrectos." };
  }
  if (user.Estado_Cuenta !== "Activo") {
    return { error: `La cuenta está ${user.Estado_Cuenta.toLowerCase()}. Contacta al administrador.` };
  }
  if (rolEsperado && user.Rol !== rolEsperado) {
    return { error: `Este acceso es para ${rolEsperado.toLowerCase()}s.` };
  }
  if (user.Rol === "Admin") {
    if (!codigoAdmin || codigoAdmin !== user.Codigo_Admin) {
      return { error: "El código de administrador no coincide." };
    }
  }
  if (user.Two_Factor === 1 && pin !== user.PIN_Respaldo) {
    return { error: "El PIN de autenticación en dos pasos es obligatorio." };
  }

  await createSession(user);
  await logAudit(user.ID_Usuario, "Inicio de sesión", user.Rol);
  redirect(homeForRole(user.Rol));
}

export async function registerRecolectorAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const nombres = String(formData.get("nombres") || "").trim();
  const apellidos = String(formData.get("apellidos") || "").trim();
  const nacimiento = String(formData.get("nacimiento") || "").trim();
  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const telefono = String(formData.get("telefono") || "").trim();
  const zona = String(formData.get("zona") || "Centro");
  const password = String(formData.get("password") || "");

  if (!nombres || !apellidos || !correo || !password || !nacimiento || !telefono) {
    return { error: "Completa todos los campos del registro." };
  }
  if (passwordStrength(password).score < 3) {
    return { error: "La contraseña debe ser al menos aceptable (8 caracteres, mayúscula y número)." };
  }
  const exists = await queryOne("SELECT ID_Usuario FROM Usuarios WHERE lower(Correo) = ?", [correo]);
  if (exists) return { error: "Ese correo ya está registrado." };

  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const { insertId } = await execute(
    `INSERT INTO Usuarios (Rol, Nombres, Apellidos, Correo, Password_Hash, Fecha_Nacimiento, Telefono, PIN_Respaldo, Zona)
     VALUES ('Recolector', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombres, apellidos, correo, await hash(password, 10), nacimiento, telefono, pin, zona],
  );
  const user = await queryOne<Usuario>("SELECT * FROM Usuarios WHERE ID_Usuario = ?", [insertId]);
  if (!user) return { error: "No se pudo crear la cuenta." };
  await createSession(user);
  await logAudit(user.ID_Usuario, "Registro", `PIN de respaldo ${pin}`);
  redirect("/app");
}

export async function registerAdminAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const nombres = String(formData.get("nombres") || "").trim();
  const apellidos = String(formData.get("apellidos") || "").trim();
  const nacimiento = String(formData.get("nacimiento") || "").trim();
  const tipoDoc = String(formData.get("tipo_documento") || "CC");
  const numDoc = String(formData.get("numero_documento") || "").trim();
  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!nombres || !apellidos || !correo || !password || !numDoc) {
    return { error: "Completa los datos de creación de cuenta." };
  }
  if (passwordStrength(password).score < 3) {
    return { error: "La contraseña no cumple el indicador de seguridad mínimo." };
  }
  const exists = await queryOne("SELECT ID_Usuario FROM Usuarios WHERE lower(Correo) = ?", [correo]);
  if (exists) return { error: "Ese correo ya está registrado." };

  const count = await queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM Usuarios WHERE Rol = 'Admin'");
  const codigo = `SAR-ADM-${String(Number(count?.total || 0) + 1).padStart(2, "0")}`;
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const { insertId } = await execute(
    `INSERT INTO Usuarios (Rol, Nombres, Apellidos, Correo, Password_Hash, Fecha_Nacimiento, Tipo_Documento, Numero_Documento, Codigo_Admin, PIN_Respaldo)
     VALUES ('Admin', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombres, apellidos, correo, await hash(password, 10), nacimiento, tipoDoc, numDoc, codigo, pin],
  );
  const user = await queryOne<Usuario>("SELECT * FROM Usuarios WHERE ID_Usuario = ?", [insertId]);
  if (!user) return { error: "No se pudo crear el administrador." };
  await createSession(user);
  await logAudit(user.ID_Usuario, "Alta de administrador", `Código ${codigo} · PIN ${pin}`);
  redirect("/admin");
}

export async function recoverAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identificador = String(formData.get("identificador") || "").trim().toLowerCase();
  const pin = String(formData.get("pin") || "").trim();
  const nueva = String(formData.get("nueva") || "");
  if (!identificador || !pin || !nueva) return { error: "Ingresa correo o ID, PIN y la nueva contraseña." };

  const user = await queryOne<Usuario>(
    "SELECT * FROM Usuarios WHERE lower(Correo) = ? OR Codigo_Admin = ? OR CAST(ID_Usuario AS TEXT) = ?",
    [identificador, identificador.toUpperCase(), identificador],
  );
  if (!user || user.PIN_Respaldo !== pin) {
    return { error: "No coinciden el identificador y el PIN de respaldo." };
  }
  await execute("UPDATE Usuarios SET Password_Hash = ? WHERE ID_Usuario = ?", [await hash(nueva, 10), user.ID_Usuario]);
  await logAudit(user.ID_Usuario, "Recuperación de credenciales");
  return { ok: "Contraseña actualizada. Ya puedes iniciar sesión." };
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) await logAudit(user.ID_Usuario, "Cierre de sesión");
  await destroySession();
  redirect("/acceso");
}

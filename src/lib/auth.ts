import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { execute, queryOne } from "./db";
import type { Usuario } from "./types";

const COOKIE = "sar_session";

function secret() {
  const value = process.env.AUTH_SECRET || "sar-desarrollo-clave-local-no-usar-en-produccion";
  return new TextEncoder().encode(value);
}

export type SessionPayload = {
  id: number;
  rol: Usuario["Rol"];
  nombre: string;
};

export async function createSession(user: Pick<Usuario, "ID_Usuario" | "Rol" | "Nombres">) {
  const token = await new SignJWT({
    id: user.ID_Usuario,
    rol: user.Rol,
    nombre: user.Nombres,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: Number(payload.id),
      rol: payload.rol as Usuario["Rol"],
      nombre: String(payload.nombre),
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;
  return queryOne<Usuario>("SELECT * FROM Usuarios WHERE ID_Usuario = ?", [session.id]);
}

export async function requireUser(roles?: Usuario["Rol"][]) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.Estado_Cuenta !== "Activo") return null;
  if (roles && !roles.includes(user.Rol)) return null;
  return user;
}

export async function verifyPassword(plain: string, hash: string) {
  return compare(plain, hash);
}

export async function logAudit(userId: number, accion: string, detalle?: string) {
  await execute("INSERT INTO Auditoria_Sesion (ID_Usuario, Accion, Detalle) VALUES (?, ?, ?)", [
    userId,
    accion,
    detalle ?? null,
  ]);
}

export function homeForRole(rol: Usuario["Rol"]) {
  if (rol === "Admin") return "/admin";
  if (rol === "Operador") return "/operador";
  return "/app";
}

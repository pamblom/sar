import { hash } from "bcryptjs";
import { createSession } from "@/lib/auth";
import { execute, queryOne } from "@/lib/db";
import type { Usuario } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    nombres?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    password?: string;
  };
  const nombres = String(body.nombres || "").trim();
  const apellidos = String(body.apellidos || "").trim();
  const correo = String(body.correo || "").trim().toLowerCase();
  const telefono = String(body.telefono || "").trim();
  const password = String(body.password || "");
  if (!nombres || !apellidos || !correo || !telefono || password.length < 8) {
    return Response.json({ error: "Completa los datos. La contraseña debe tener 8 caracteres o más." }, { status: 400 });
  }
  const exists = await queryOne("SELECT ID_Usuario FROM Usuarios WHERE lower(Correo) = ?", [correo]);
  if (exists) return Response.json({ error: "Ese correo ya está registrado." }, { status: 409 });
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const { insertId } = await execute(
    `INSERT INTO Usuarios (Rol, Nombres, Apellidos, Correo, Password_Hash, Telefono, PIN_Respaldo, Zona)
     VALUES ('Recolector', ?, ?, ?, ?, ?, ?, 'Centro')`,
    [nombres, apellidos, correo, await hash(password, 10), telefono, pin],
  );
  const user = await queryOne<Usuario>("SELECT * FROM Usuarios WHERE ID_Usuario = ?", [insertId]);
  if (!user) return Response.json({ error: "No se pudo crear la cuenta." }, { status: 500 });
  await createSession(user);
  return Response.json({ ok: true, pin });
}

import { compare } from "bcryptjs";
import { createSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import type { Usuario } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { correo?: string; password?: string };
  const correo = String(body.correo || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = await queryOne<Usuario>("SELECT * FROM Usuarios WHERE lower(Correo) = ?", [correo]);
  if (!user || !(await compare(password, user.Password_Hash))) {
    return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }
  if (user.Estado_Cuenta !== "Activo") {
    return Response.json({ error: `La cuenta está ${user.Estado_Cuenta}.` }, { status: 403 });
  }
  await createSession(user);
  return Response.json({
    id: user.ID_Usuario,
    rol: user.Rol,
    nombres: user.Nombres,
    apellidos: user.Apellidos,
    puntos: user.Puntos_Acumulados,
    zona: user.Zona,
    nivel: user.Nivel,
  });
}

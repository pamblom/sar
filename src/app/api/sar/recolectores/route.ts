async function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function GET() {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user || user.Rol === "Recolector") return json({ error: "Inicia sesión." }, 401);
  const { userMetrics, ranking } = await import("@/lib/sar");
  const { queryRows } = await import("@/lib/db");
  const metrics = await userMetrics();
  const people = await queryRows<{
    ID_Usuario: number;
    Nombres: string;
    Apellidos: string;
    Numero_Documento: string | null;
    Puntos_Acumulados: number;
    Estado_Cuenta: string;
    Nivel: number;
    Zona: string | null;
    kilos: number;
    material: string | null;
  }>(
    `SELECT u.ID_Usuario, u.Nombres, u.Apellidos, u.Numero_Documento, u.Puntos_Acumulados, u.Estado_Cuenta, u.Nivel, u.Zona,
            COALESCE((SELECT SUM(Kilos) FROM Solicitudes_Pesaje s WHERE s.ID_Recolector = u.ID_Usuario AND s.Estado = 'Aprobada'), 0) AS kilos,
            (SELECT m.Nombre FROM Solicitudes_Pesaje s
             JOIN Materiales m ON m.ID_Material = s.ID_Material
             WHERE s.ID_Recolector = u.ID_Usuario
             GROUP BY m.Nombre ORDER BY SUM(s.Kilos) DESC LIMIT 1) AS material
     FROM Usuarios u WHERE u.Rol = 'Recolector'
     ORDER BY u.Puntos_Acumulados DESC`,
  );
  const top = await ranking();
  return json({ metrics, people, top });
}

export async function PATCH(request: Request) {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user || user.Rol === "Recolector") return json({ error: "Inicia sesión." }, 401);
  const { execute } = await import("@/lib/db");
  const body = (await request.json()) as { id?: number; estado?: string };
  const allowed = ["Activo", "Bloqueado", "Suspendido", "Vetado"];
  if (!body.id || !body.estado || !allowed.includes(body.estado)) {
    return json({ error: "Datos inválidos" }, 400);
  }
  await execute("UPDATE Usuarios SET Estado_Cuenta = ? WHERE ID_Usuario = ? AND Rol = 'Recolector'", [body.estado, body.id]);
  return json({ ok: true });
}

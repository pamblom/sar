import { getCurrentUser } from "@/lib/auth";
import { listSolicitudes, ranking } from "@/lib/sar";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ user: null }, { status: 401 });
  const pesajes =
    user.Rol === "Recolector" ? await listSolicitudes({ recolectorId: user.ID_Usuario }) : await listSolicitudes({ estado: "todas" });
  const tabla = user.Rol === "Recolector" ? await ranking({ zona: user.Zona || "todas" }) : await ranking();
  return Response.json({
    user: {
      id: user.ID_Usuario,
      rol: user.Rol,
      nombres: user.Nombres,
      apellidos: user.Apellidos,
      puntos: user.Puntos_Acumulados,
      zona: user.Zona,
      nivel: user.Nivel,
      correo: user.Correo,
    },
    pesajes,
    ranking: tabla,
  });
}

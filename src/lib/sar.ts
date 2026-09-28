import { execute, queryOne, queryRows } from "./db";
import { nextCodigo, nivelDesdePuntos } from "./format";
import type { Material, Notificacion, RankingRow, SolicitudVista, Usuario } from "./types";

export async function listMateriales(soloActivos = false) {
  const sql = soloActivos
    ? "SELECT * FROM Materiales WHERE Estado = 'Activo' ORDER BY Nombre"
    : "SELECT * FROM Materiales ORDER BY Categoria, Nombre";
  return queryRows<Material>(sql);
}

export async function listRecolectores() {
  return queryRows<Usuario>("SELECT * FROM Usuarios WHERE Rol = 'Recolector' ORDER BY Nombres");
}

export async function listUsuarios() {
  return queryRows<Usuario>("SELECT * FROM Usuarios ORDER BY Rol, Nombres");
}

export async function nextSolicitudCodigo() {
  const last = await queryOne<{ Codigo: string }>(
    "SELECT Codigo FROM Solicitudes_Pesaje ORDER BY CAST(substr(Codigo, 10) AS INTEGER) DESC LIMIT 1",
  );
  return nextCodigo(last?.Codigo);
}

export async function listSolicitudes(filtro?: { estado?: string; q?: string; recolectorId?: number }) {
  const clauses = ["1=1"];
  const params: (string | number)[] = [];
  if (filtro?.estado && filtro.estado !== "todas") {
    clauses.push("s.Estado = ?");
    params.push(filtro.estado);
  }
  if (filtro?.recolectorId) {
    clauses.push("s.ID_Recolector = ?");
    params.push(filtro.recolectorId);
  }
  if (filtro?.q) {
    clauses.push("(s.Codigo LIKE ? OR u.Nombres LIKE ? OR u.Apellidos LIKE ?)");
    const like = `%${filtro.q}%`;
    params.push(like, like, like);
  }
  return queryRows<SolicitudVista>(
    `SELECT s.*, u.Nombres || ' ' || u.Apellidos AS Recolector, u.Nivel AS NivelRecolector,
            m.Nombre AS MaterialNombre, m.Categoria,
            ROUND(s.Kilos * m.Puntos_por_Kg, 2) AS PuntosEstimados,
            ROUND(s.Kilos * m.Impacto_Huella_Carbono, 2) AS Huella
     FROM Solicitudes_Pesaje s
     JOIN Usuarios u ON u.ID_Usuario = s.ID_Recolector
     JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE ${clauses.join(" AND ")}
     ORDER BY s.Fecha_Creacion DESC`,
    params,
  );
}

export async function getSolicitud(id: number) {
  const rows = await listSolicitudes();
  return rows.find((item) => item.ID_Solicitud === id) ?? null;
}

export async function dashboardMetrics(days = 30) {
  const since = `datetime('now', '-${days} days')`;
  const kilos = await queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(Kilos), 0) AS total FROM Solicitudes_Pesaje WHERE Estado = 'Aprobada' AND Fecha_Creacion >= ${since}`,
  );
  const puntos = await queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(Puntos_Acreditados), 0) AS total FROM Historial_Ranking WHERE Fecha_Asignacion >= ${since}`,
  );
  const pendientes = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM Solicitudes_Pesaje WHERE Estado = 'Pendiente'",
  );
  const recolectores = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM Usuarios WHERE Rol = 'Recolector' AND Estado_Cuenta = 'Activo'",
  );
  const huella = await queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(s.Kilos * m.Impacto_Huella_Carbono), 0) AS total
     FROM Solicitudes_Pesaje s JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE s.Estado = 'Aprobada' AND s.Fecha_Creacion >= ${since}`,
  );
  const porMes = await queryRows<{ mes: string; kilos: number }>(
    `SELECT strftime('%Y-%m', Fecha_Creacion) AS mes, COALESCE(SUM(Kilos), 0) AS kilos
     FROM Solicitudes_Pesaje WHERE Estado = 'Aprobada'
     GROUP BY mes ORDER BY mes DESC LIMIT 6`,
  );
  const porMaterial = await queryRows<{ nombre: string; kilos: number }>(
    `SELECT m.Nombre AS nombre, COALESCE(SUM(s.Kilos), 0) AS kilos
     FROM Solicitudes_Pesaje s JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE s.Estado = 'Aprobada' AND s.Fecha_Creacion >= ${since}
     GROUP BY m.ID_Material ORDER BY kilos DESC`,
  );
  return {
    kilos: Number(kilos?.total || 0),
    puntos: Number(puntos?.total || 0),
    pendientes: Number(pendientes?.total || 0),
    recolectores: Number(recolectores?.total || 0),
    huella: Number(huella?.total || 0),
    porMes: porMes.reverse(),
    porMaterial,
  };
}

export async function ranking(filtro?: { zona?: string; days?: number }) {
  const clauses = ["u.Rol = 'Recolector'"];
  const params: (string | number)[] = [];
  if (filtro?.zona && filtro.zona !== "todas") {
    clauses.push("u.Zona = ?");
    params.push(filtro.zona);
  }
  const days = filtro?.days ?? 3650;
  return queryRows<RankingRow>(
    `SELECT u.ID_Usuario, u.Nombres, u.Apellidos, u.Zona, u.Nivel, u.Puntos_Acumulados,
            COALESCE((
              SELECT SUM(s.Kilos) FROM Solicitudes_Pesaje s
              WHERE s.ID_Recolector = u.ID_Usuario AND s.Estado = 'Aprobada'
                AND s.Fecha_Creacion >= datetime('now', '-${days} days')
            ), 0) AS Kilos
     FROM Usuarios u
     WHERE ${clauses.join(" AND ")}
     ORDER BY u.Puntos_Acumulados DESC, u.Nombres ASC`,
    params,
  );
}

export async function userMetrics() {
  const total = await queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM Usuarios WHERE Rol = 'Recolector'");
  const activos = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM Usuarios WHERE Rol = 'Recolector' AND Estado_Cuenta = 'Activo'",
  );
  const puntos = await queryOne<{ total: number }>(
    "SELECT COALESCE(SUM(Puntos_Acumulados), 0) AS total FROM Usuarios WHERE Rol = 'Recolector'",
  );
  const pred = await queryOne<{ nombre: string }>(
    `SELECT m.Nombre AS nombre FROM Solicitudes_Pesaje s
     JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE s.Estado = 'Aprobada'
     GROUP BY m.ID_Material ORDER BY SUM(s.Kilos) DESC LIMIT 1`,
  );
  return {
    total: Number(total?.total || 0),
    activos: Number(activos?.total || 0),
    puntos: Number(puntos?.total || 0),
    predominante: pred?.nombre ?? "—",
  };
}

export async function notifications(userId: number) {
  return queryRows<Notificacion>(
    "SELECT * FROM Notificaciones WHERE ID_Usuario = ? ORDER BY Fecha DESC LIMIT 12",
    [userId],
  );
}

export async function auditLog(userId: number) {
  return queryRows<{ ID_Evento: number; Accion: string; Detalle: string | null; Fecha: string }>(
    "SELECT * FROM Auditoria_Sesion WHERE ID_Usuario = ? ORDER BY Fecha DESC LIMIT 20",
    [userId],
  );
}

export async function notify(userId: number, titulo: string, mensaje: string) {
  await execute("INSERT INTO Notificaciones (ID_Usuario, Titulo, Mensaje) VALUES (?, ?, ?)", [userId, titulo, mensaje]);
}

export async function acreditarPuntos(recolectorId: number, solicitudId: number, puntos: number) {
  await execute("INSERT INTO Historial_Ranking (ID_Recolector, ID_Solicitud, Puntos_Acreditados) VALUES (?, ?, ?)", [
    recolectorId,
    solicitudId,
    puntos,
  ]);
  const user = await queryOne<Usuario>("SELECT * FROM Usuarios WHERE ID_Usuario = ?", [recolectorId]);
  if (!user) return;
  const nuevo = Number(user.Puntos_Acumulados) + puntos;
  const nivel = nivelDesdePuntos(nuevo).nivel;
  await execute("UPDATE Usuarios SET Puntos_Acumulados = ?, Nivel = ? WHERE ID_Usuario = ?", [nuevo, nivel, recolectorId]);
}

export async function impactoRecolector(userId: number) {
  const row = await queryOne<{ kilos: number; huella: number; pesajes: number }>(
    `SELECT COALESCE(SUM(s.Kilos), 0) AS kilos,
            COALESCE(SUM(s.Kilos * m.Impacto_Huella_Carbono), 0) AS huella,
            COUNT(*) AS pesajes
     FROM Solicitudes_Pesaje s JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE s.ID_Recolector = ? AND s.Estado = 'Aprobada'`,
    [userId],
  );
  const hoy = await queryOne<{ huella: number }>(
    `SELECT COALESCE(SUM(s.Kilos * m.Impacto_Huella_Carbono), 0) AS huella
     FROM Solicitudes_Pesaje s JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE s.ID_Recolector = ? AND s.Estado = 'Aprobada' AND date(s.Fecha_Creacion) = date('now')`,
    [userId],
  );
  return {
    kilos: Number(row?.kilos || 0),
    huella: Number(row?.huella || 0),
    pesajes: Number(row?.pesajes || 0),
    impactoHoy: Number(hoy?.huella || 0),
  };
}

export async function historialPuntos(userId: number) {
  return queryRows<{ Puntos_Acreditados: number; Fecha_Asignacion: string; Codigo: string; Material: string }>(
    `SELECT h.Puntos_Acreditados, h.Fecha_Asignacion, s.Codigo, m.Nombre AS Material
     FROM Historial_Ranking h
     JOIN Solicitudes_Pesaje s ON s.ID_Solicitud = h.ID_Solicitud
     JOIN Materiales m ON m.ID_Material = s.ID_Material
     WHERE h.ID_Recolector = ?
     ORDER BY h.Fecha_Asignacion DESC`,
    [userId],
  );
}

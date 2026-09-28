import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createClient, type Client, type InValue } from "@libsql/client";
import { hashSync } from "bcryptjs";

type SqlParam = string | number | bigint | boolean | null;
type SqlParams = SqlParam[];

export type SqlRow = Record<string, string | number | bigint | null>;

let client: Client | null = null;
let ready: Promise<Client> | null = null;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS Usuarios (
    ID_Usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    Rol TEXT NOT NULL CHECK (Rol IN ('Admin', 'Recolector', 'Operador')),
    Nombres TEXT NOT NULL,
    Apellidos TEXT NOT NULL,
    Correo TEXT UNIQUE NOT NULL,
    Password_Hash TEXT NOT NULL,
    Nivel INTEGER DEFAULT 1,
    Puntos_Acumulados REAL DEFAULT 0.00,
    Estado_Cuenta TEXT DEFAULT 'Activo' CHECK (Estado_Cuenta IN ('Activo', 'Bloqueado', 'Suspendido', 'Vetado')),
    Fecha_Registro TEXT DEFAULT (datetime('now')),
    Fecha_Nacimiento TEXT,
    Telefono TEXT,
    Tipo_Documento TEXT,
    Numero_Documento TEXT,
    Codigo_Admin TEXT,
    PIN_Respaldo TEXT,
    Zona TEXT DEFAULT 'Centro',
    Lugar_Acopio TEXT DEFAULT 'Centro de acopio Manga',
    Two_Factor INTEGER DEFAULT 0,
    Alertas_Sonoras INTEGER DEFAULT 1,
    Tema TEXT DEFAULT 'esmeralda'
  )`,
  `CREATE TABLE IF NOT EXISTS Materiales (
    ID_Material INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    Categoria TEXT NOT NULL,
    Impacto_Huella_Carbono REAL NOT NULL,
    Puntos_por_Kg REAL NOT NULL,
    Estado TEXT DEFAULT 'Activo' CHECK (Estado IN ('Activo', 'Inactivo'))
  )`,
  `CREATE TABLE IF NOT EXISTS Solicitudes_Pesaje (
    ID_Solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
    Codigo TEXT UNIQUE NOT NULL,
    ID_Recolector INTEGER NOT NULL,
    ID_Material INTEGER NOT NULL,
    ID_Operador INTEGER,
    Kilos REAL NOT NULL CHECK (Kilos > 0),
    Foto_URL TEXT,
    IA_Fidelidad_Reconocimiento REAL CHECK (IA_Fidelidad_Reconocimiento BETWEEN 0 AND 100),
    Bascula_Telemetria TEXT,
    Estado TEXT DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobada', 'Denegada')),
    Motivo_Rechazo TEXT,
    Comentario_Rechazo TEXT,
    Zona TEXT DEFAULT 'Centro',
    Manifiesto TEXT,
    Fecha_Creacion TEXT DEFAULT (datetime('now')),
    Fecha_Validacion TEXT,
    FOREIGN KEY (ID_Recolector) REFERENCES Usuarios(ID_Usuario),
    FOREIGN KEY (ID_Material) REFERENCES Materiales(ID_Material),
    FOREIGN KEY (ID_Operador) REFERENCES Usuarios(ID_Usuario)
  )`,
  `CREATE TABLE IF NOT EXISTS Historial_Ranking (
    ID_Transaccion INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Recolector INTEGER NOT NULL,
    ID_Solicitud INTEGER NOT NULL,
    Puntos_Acreditados REAL NOT NULL,
    Fecha_Asignacion TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ID_Recolector) REFERENCES Usuarios(ID_Usuario),
    FOREIGN KEY (ID_Solicitud) REFERENCES Solicitudes_Pesaje(ID_Solicitud)
  )`,
  `CREATE TABLE IF NOT EXISTS Notificaciones (
    ID_Notificacion INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Usuario INTEGER NOT NULL,
    Titulo TEXT NOT NULL,
    Mensaje TEXT NOT NULL,
    Leida INTEGER DEFAULT 0,
    Fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
  )`,
  `CREATE TABLE IF NOT EXISTS Auditoria_Sesion (
    ID_Evento INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Usuario INTEGER NOT NULL,
    Accion TEXT NOT NULL,
    Detalle TEXT,
    Fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
  )`,
];

function databaseUrl() {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  if (process.env.VERCEL) return "file:/tmp/sar.sqlite";
  const file = join(process.cwd(), "data", "sar.sqlite").replaceAll("\\", "/");
  mkdirSync(dirname(file), { recursive: true });
  return `file:${file}`;
}

const PASSWORD = "sar2026";
const PIN = "2468";

async function seed(database: Client) {
  const counted = await database.execute("SELECT COUNT(*) AS total FROM Usuarios");
  if (Number(counted.rows[0]?.total || 0) > 0) return;

  const passwordHash = hashSync(PASSWORD, 10);

  const users = [
    {
      rol: "Admin",
      nombres: "Pablo",
      apellidos: "Corrales",
      correo: "pablo.corrales@sar.local",
      nivel: 4,
      puntos: 0,
      nacimiento: "1998-04-12",
      telefono: "3001112233",
      tipoDoc: "CC",
      numDoc: "1045000001",
      codigo: "SAR-ADM-01",
      zona: "Manga",
      lugar: "Centro de acopio Manga",
    },
    {
      rol: "Operador",
      nombres: "Juan Manuel",
      apellidos: "Llanes",
      correo: "juan.llanes@sar.local",
      nivel: 1,
      puntos: 0,
      nacimiento: "1996-08-21",
      telefono: "3002223344",
      tipoDoc: "CC",
      numDoc: "1045000002",
      codigo: null,
      zona: "Manga",
      lugar: "Centro de acopio Manga",
    },
    {
      rol: "Operador",
      nombres: "Juan",
      apellidos: "Hernández",
      correo: "juan.hernandez@sar.local",
      nivel: 1,
      puntos: 0,
      nacimiento: "1997-01-09",
      telefono: "3003334455",
      tipoDoc: "CC",
      numDoc: "1045000003",
      codigo: null,
      zona: "Getsemaní",
      lugar: "Punto Getsemaní",
    },
    {
      rol: "Recolector",
      nombres: "Jean Carlos",
      apellidos: "Saldaña",
      correo: "jean.saldana@sar.local",
      nivel: 3,
      puntos: 1860,
      nacimiento: "1994-11-03",
      telefono: "3004445566",
      tipoDoc: "CC",
      numDoc: "1045000004",
      codigo: null,
      zona: "La Boquilla",
      lugar: null,
    },
    {
      rol: "Recolector",
      nombres: "Jaime",
      apellidos: "Ochoa",
      correo: "jaime.ochoa@sar.local",
      nivel: 2,
      puntos: 920,
      nacimiento: "1995-06-18",
      telefono: "3005556677",
      tipoDoc: "CC",
      numDoc: "1045000005",
      codigo: null,
      zona: "Bocagrande",
      lugar: null,
    },
    {
      rol: "Recolector",
      nombres: "Carlos",
      apellidos: "Pérez",
      correo: "carlos.perez@sar.local",
      nivel: 3,
      puntos: 3450,
      nacimiento: "1990-02-14",
      telefono: "3006667788",
      tipoDoc: "CC",
      numDoc: "1045000006",
      codigo: null,
      zona: "Centro",
      lugar: null,
    },
  ];

  for (const user of users) {
    await database.execute({
      sql: `INSERT INTO Usuarios
        (Rol, Nombres, Apellidos, Correo, Password_Hash, Nivel, Puntos_Acumulados, Fecha_Nacimiento, Telefono, Tipo_Documento, Numero_Documento, Codigo_Admin, PIN_Respaldo, Zona, Lugar_Acopio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.rol,
        user.nombres,
        user.apellidos,
        user.correo,
        passwordHash,
        user.nivel,
        user.puntos,
        user.nacimiento,
        user.telefono,
        user.tipoDoc,
        user.numDoc,
        user.codigo,
        PIN,
        user.zona,
        user.lugar,
      ],
    });
  }

  const materiales = [
    { nombre: "PET transparente", categoria: "Plástico", co2: 1.52, puntos: 12 },
    { nombre: "HDPE color", categoria: "Plástico", co2: 1.18, puntos: 10 },
    { nombre: "Cartón corrugado", categoria: "Papel y cartón", co2: 0.86, puntos: 6 },
    { nombre: "Papel archivo", categoria: "Papel y cartón", co2: 0.74, puntos: 5 },
    { nombre: "Aluminio", categoria: "Metal", co2: 9.1, puntos: 28 },
    { nombre: "Chatarra ferrosa", categoria: "Metal", co2: 1.65, puntos: 8 },
    { nombre: "Vidrio claro", categoria: "Vidrio", co2: 0.32, puntos: 4 },
    { nombre: "Tetra Pak", categoria: "Compuesto", co2: 0.91, puntos: 7 },
  ];

  for (const material of materiales) {
    await database.execute({
      sql: `INSERT INTO Materiales (Nombre, Categoria, Impacto_Huella_Carbono, Puntos_por_Kg) VALUES (?, ?, ?, ?)`,
      args: [material.nombre, material.categoria, material.co2, material.puntos],
    });
  }

  const idOf = async (correo: string) => {
    const result = await database.execute({
      sql: "SELECT ID_Usuario FROM Usuarios WHERE Correo = ?",
      args: [correo],
    });
    return Number(result.rows[0]?.ID_Usuario);
  };

  const jean = await idOf("jean.saldana@sar.local");
  const jaime = await idOf("jaime.ochoa@sar.local");
  const carlos = await idOf("carlos.perez@sar.local");
  const operador = await idOf("juan.llanes@sar.local");

  const samples = [
    {
      codigo: "SAR-2026-00018",
      recolector: jean,
      material: 1,
      kilos: 24.5,
      fidelidad: 96.4,
      estado: "Pendiente",
      zona: "La Boquilla",
      foto: null,
      telemetria: "Báscula óptica BOQ-04 · 24.52 kg",
      dias: 0,
    },
    {
      codigo: "SAR-2026-00017",
      recolector: carlos,
      material: 5,
      kilos: 8.2,
      fidelidad: 91.1,
      estado: "Pendiente",
      zona: "Centro",
      foto: null,
      telemetria: "Báscula óptica CEN-01 · 8.18 kg",
      dias: 0,
    },
    {
      codigo: "SAR-2026-00012",
      recolector: jaime,
      material: 3,
      kilos: 41,
      fidelidad: 88.0,
      estado: "Aprobada",
      zona: "Bocagrande",
      foto: null,
      telemetria: "Báscula óptica BCG-02 · 41.04 kg",
      dias: 4,
    },
    {
      codigo: "SAR-2026-00009",
      recolector: jean,
      material: 5,
      kilos: 12.4,
      fidelidad: 94.2,
      estado: "Aprobada",
      zona: "La Boquilla",
      foto: null,
      telemetria: "Báscula óptica BOQ-04 · 12.41 kg",
      dias: 12,
    },
    {
      codigo: "SAR-2026-00007",
      recolector: carlos,
      material: 7,
      kilos: 33,
      fidelidad: 62.5,
      estado: "Denegada",
      zona: "Centro",
      foto: null,
      telemetria: "Báscula óptica CEN-01 · 33.00 kg",
      dias: 18,
    },
  ];

  for (const sample of samples) {
    const creado = new Date(Date.now() - sample.dias * 86400000).toISOString().slice(0, 19).replace("T", " ");
    const inserted = await database.execute({
      sql: `INSERT INTO Solicitudes_Pesaje
        (Codigo, ID_Recolector, ID_Material, ID_Operador, Kilos, Foto_URL, IA_Fidelidad_Reconocimiento, Bascula_Telemetria, Estado, Zona, Manifiesto, Fecha_Creacion, Motivo_Rechazo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sample.codigo,
        sample.recolector,
        sample.material,
        sample.estado === "Pendiente" ? null : operador,
        sample.kilos,
        sample.foto,
        sample.fidelidad,
        sample.telemetria,
        sample.estado,
        sample.zona,
        `MAN-${sample.codigo}`,
        creado,
        sample.estado === "Denegada" ? "Material contaminado" : null,
      ],
    });
    const solicitudId = Number(inserted.lastInsertRowid);
    if (sample.estado === "Aprobada") {
      const puntosRow = await database.execute({
        sql: "SELECT Puntos_por_Kg FROM Materiales WHERE ID_Material = ?",
        args: [sample.material],
      });
      const puntosKg = Number(puntosRow.rows[0]?.Puntos_por_Kg || 0);
      const puntos = Number((puntosKg * sample.kilos).toFixed(2));
      await database.execute({
        sql: `INSERT INTO Historial_Ranking (ID_Recolector, ID_Solicitud, Puntos_Acreditados, Fecha_Asignacion) VALUES (?, ?, ?, ?)`,
        args: [sample.recolector, solicitudId, puntos, creado],
      });
    }
  }

  await database.execute({
    sql: `INSERT INTO Notificaciones (ID_Usuario, Titulo, Mensaje) VALUES (?, ?, ?)`,
    args: [jean, "Solicitud en revisión", "Tu pesaje SAR-2026-00018 espera validación del administrador."],
  });
}

async function getClient() {
  if (client) return client;
  if (!ready) {
    ready = (async () => {
      const database = createClient({
        url: databaseUrl(),
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      await database.execute("PRAGMA foreign_keys = ON");
      for (const statement of SCHEMA_STATEMENTS) {
        await database.execute(statement);
      }
      await seed(database);
      client = database;
      return database;
    })();
  }
  return ready;
}

export async function queryRows<T extends SqlRow>(sql: string, params: SqlParams = []) {
  const database = await getClient();
  const result = await database.execute({ sql, args: params as InValue[] });
  return result.rows as unknown as T[];
}

export async function queryOne<T extends SqlRow>(sql: string, params: SqlParams = []) {
  const rows = await queryRows<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: SqlParams = []) {
  const database = await getClient();
  const result = await database.execute({ sql, args: params as InValue[] });
  return { insertId: Number(result.lastInsertRowid), changes: result.rowsAffected };
}

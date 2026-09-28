import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function statementsFrom(sql) {
  return sql
    .split(";")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0 && !chunk.startsWith("--"));
}

loadEnv();

const config = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "tracker",
  password: process.env.MYSQL_PASSWORD || "tracker_pass",
  database: process.env.MYSQL_DATABASE || "tracker",
  multipleStatements: true,
};

async function ensureDatabase() {
  const adminUser = process.env.MYSQL_ROOT_USER || "root";
  const adminPassword = process.env.MYSQL_ROOT_PASSWORD ?? config.password;
  const sql = `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;

  try {
    const asApp = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    await asApp.query(sql);
    await asApp.end();
    return;
  } catch {
    const asRoot = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: adminUser,
      password: adminPassword,
    });
    await asRoot.query(sql);
    await asRoot.query(
      `CREATE USER IF NOT EXISTS '${config.user}'@'%' IDENTIFIED BY '${config.password}'`,
    );
    await asRoot.query(`GRANT ALL ON \`${config.database}\`.* TO '${config.user}'@'%'`);
    await asRoot.query("FLUSH PRIVILEGES");
    await asRoot.end();
  }
}

async function waitForMysql() {
  const started = Date.now();
  while (Date.now() - started < 90000) {
    try {
      await ensureDatabase();
      const connection = await mysql.createConnection(config);
      await connection.query("SELECT 1");
      await connection.end();
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Esperando MySQL (${message})...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("No se pudo conectar a MySQL. ¿Está Docker o el servidor levantado?");
}

async function main() {
  await waitForMysql();
  const db = await mysql.createConnection(config);
  const schema = fs.readFileSync(path.join(root, "database", "schema.sql"), "utf8");
  for (const statement of statementsFrom(schema)) {
    await db.query(statement);
  }

  const [users] = await db.query("SELECT COUNT(*) AS total FROM users");
  const total = Number(users[0]?.total || 0);
  if (total > 0) {
    console.log("La base ya tiene datos. Tablas verificadas, sin volver a sembrar.");
    await db.end();
    return;
  }

  const password = async (plain) => bcrypt.hash(plain, 10);
  const now = new Date();

  await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone, created_at) VALUES
      (?, ?, ?, 'admin', '555-0100', ?),
      (?, ?, ?, 'agent', '555-0101', ?),
      (?, ?, ?, 'agent', '555-0102', ?),
      (?, ?, ?, 'customer', '555-0201', ?),
      (?, ?, ?, 'customer', '555-0202', ?)`,
    [
      "Pablo Corrales",
      "pablo.corrales@tracker.local",
      await password("Admin123"),
      now,
      "Juan Manuel Yanes",
      "juan.yanes@tracker.local",
      await password("Agente123"),
      now,
      "Juan Hernandez",
      "juan.hernandez@tracker.local",
      await password("Agente123"),
      now,
      "Jean Carlos Saldaña",
      "jean.saldana@tracker.local",
      await password("Cliente123"),
      now,
      "Jaime Ochoa",
      "jaime.ochoa@tracker.local",
      await password("Cliente123"),
      now,
    ],
  );

  const [ids] = await db.query(
    "SELECT id, email FROM users WHERE email IN (?, ?, ?, ?, ?)",
    [
      "jean.saldana@tracker.local",
      "jaime.ochoa@tracker.local",
      "juan.yanes@tracker.local",
      "pablo.corrales@tracker.local",
      "juan.hernandez@tracker.local",
    ],
  );
  const byEmail = Object.fromEntries(ids.map((row) => [row.email, row.id]));

  const samples = [
    {
      number: "TRK-2026-00001",
      customer: byEmail["jean.saldana@tracker.local"],
      assignee: byEmail["juan.yanes@tracker.local"],
      category: "entrega",
      type: "reclamo",
      priority: "alta",
      status: "en_proceso",
      subject: "Pedido llegó incompleto",
      description:
        "Compré un kit de 4 sillas y solo recibí 3. El embalaje venía abierto. Necesito la pieza faltante o una reposición.",
      product: "Kit sillas Nova",
      order: "PED-18422",
    },
    {
      number: "TRK-2026-00002",
      customer: byEmail["jaime.ochoa@tracker.local"],
      assignee: byEmail["pablo.corrales@tracker.local"],
      category: "garantia",
      type: "garantia",
      priority: "media",
      status: "en_revision",
      subject: "Motor hace ruido a los 3 meses",
      description:
        "La licuadora empezó a sonar fuerte. Todavía está en garantía. Adjunto número de serie en la descripción: SN-99211.",
      product: "Licuadora Pulse 900",
      order: "PED-19004",
    },
    {
      number: "TRK-2026-00003",
      customer: byEmail["jean.saldana@tracker.local"],
      assignee: byEmail["juan.hernandez@tracker.local"],
      category: "facturacion",
      type: "consulta",
      priority: "baja",
      status: "nuevo",
      subject: "Necesito factura con RFC",
      description: "La compra se facturó a nombre genérico. Requiero factura con datos fiscales actualizados.",
      product: null,
      order: "PED-19110",
    },
    {
      number: "TRK-2026-00004",
      customer: byEmail["jaime.ochoa@tracker.local"],
      assignee: byEmail["juan.yanes@tracker.local"],
      category: "producto",
      type: "devolucion",
      priority: "media",
      status: "esperando_cliente",
      subject: "Quiero devolver una lámpara",
      description: "El color no coincide con la foto. Quiero devolverla. ¿Cuál es el proceso y el plazo?",
      product: "Lámpara Arco",
      order: "PED-18801",
    },
  ];

  for (const ticket of samples) {
    const [result] = await db.query(
      `INSERT INTO tickets
        (ticket_number, customer_id, assigned_to, category, type, priority, status, subject, description, product, order_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket.number,
        ticket.customer,
        ticket.assignee,
        ticket.category,
        ticket.type,
        ticket.priority,
        ticket.status,
        ticket.subject,
        ticket.description,
        ticket.product,
        ticket.order,
      ],
    );
    const ticketId = result.insertId;
    await db.query(
      `INSERT INTO ticket_events (ticket_id, user_id, event_type, new_value) VALUES (?, ?, 'created', ?)`,
      [ticketId, ticket.customer, ticket.status],
    );
    if (ticket.assignee) {
      await db.query(
        `INSERT INTO ticket_events (ticket_id, user_id, event_type, new_value) VALUES (?, ?, 'assignment', ?)`,
        [ticketId, ticket.assignee, String(ticket.assignee)],
      );
    }
  }

  await db.query(
    `INSERT INTO comments (ticket_id, user_id, body, is_internal)
     SELECT id, ?, 'Ya coordiné con almacén. Mañana sale la silla faltante.', 0
     FROM tickets WHERE ticket_number = 'TRK-2026-00001'`,
    [byEmail["juan.yanes@tracker.local"]],
  );
  await db.query(
    `INSERT INTO comments (ticket_id, user_id, body, is_internal)
     SELECT id, ?, 'Jaime pidió foto del motor. Esperar evidencia para autorizar garantía.', 1
     FROM tickets WHERE ticket_number = 'TRK-2026-00002'`,
    [byEmail["pablo.corrales@tracker.local"]],
  );

  await db.end();
  console.log("Base de datos ClaimTrack lista.");
  console.log("Cuentas de prueba:");
  console.log("  Pablo Corrales        pablo.corrales@tracker.local");
  console.log("  Juan Manuel Yanes     juan.yanes@tracker.local");
  console.log("  Juan Hernandez        juan.hernandez@tracker.local");
  console.log("  Jean Carlos Saldaña   jean.saldana@tracker.local");
  console.log("  Jaime Ochoa           jaime.ochoa@tracker.local");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

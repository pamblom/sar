import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getCurrentUser } from "@/lib/auth";
import { dashboardMetrics, listSolicitudes } from "@/lib/sar";
import { queryRows } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });

  const tipo = new URL(request.url).searchParams.get("tipo") || "reporte";
  const rows =
    tipo === "historial" && user.Rol === "Recolector"
      ? await listSolicitudes({ recolectorId: user.ID_Usuario })
      : await listSolicitudes({ estado: "todas" });

  let title = "Reporte ambiental SAR";
  let lines: string[][];
  if (tipo === "recolectores") {
    title = "Recolectores SAR";
    const people = await queryRows<{
      Nombres: string;
      Apellidos: string;
      Estado_Cuenta: string;
      Puntos_Acumulados: number;
      Zona: string | null;
    }>("SELECT Nombres, Apellidos, Estado_Cuenta, Puntos_Acumulados, Zona FROM Usuarios WHERE Rol = 'Recolector' ORDER BY Puntos_Acumulados DESC");
    lines = [
      ["Recolector", "Zona", "Estado", "Puntos"],
      ...people.map((person) => [
        `${person.Nombres} ${person.Apellidos}`,
        person.Zona || "",
        person.Estado_Cuenta,
        String(person.Puntos_Acumulados),
      ]),
    ];
  } else {
    const metrics = await dashboardMetrics(365);
    title = tipo === "historial" ? "Historial de pesajes SAR" : "Reporte ambiental SAR";
    lines = [
      ["Codigo", "Recolector", "Material", "Kilos", "Huella CO2", "Estado"],
      ...rows.map((item) => [
        String(item.Codigo),
        item.Recolector,
        item.MaterialNombre,
        String(item.Kilos),
        String(item.Huella),
        item.Estado,
      ]),
    ];
    lines.push(["", "", "", "", "Huella total", String(Number(metrics.huella || 0).toFixed(2))]);
  }

  const pdf = await buildPdf(title, lines);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${tipo}-sar.pdf"`,
    },
  });
}

function plain(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, (match) => (match === "Ñ" ? "N" : "n"))
    .replace(/[^\x20-\x7E]/g, " ");
}

async function buildPdf(title: string, rows: string[][]) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([595, 842]);
  let y = 800;
  page.drawText(plain(title), { x: 40, y, size: 16, font: bold, color: rgb(0.05, 0.25, 0.2) });
  y -= 28;
  for (const [index, row] of rows.entries()) {
    if (y < 50) {
      page = doc.addPage([595, 842]);
      y = 800;
    }
    const line = row.map((cell) => plain(cell).slice(0, 28).padEnd(18, " ")).join(" ");
    page.drawText(line, { x: 40, y, size: 9, font: index === 0 ? bold : font });
    y -= 14;
  }
  return doc.save();
}

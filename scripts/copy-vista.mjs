import fs from "node:fs";
import path from "node:path";

const map = {
  sar_mobile_inicio_de_sesi_n_liquid_glass: "login.html",
  sar_mobile_crear_cuenta_liquid_glass: "registro.html",
  sar_mobile_inicio_recolector: "inicio.html",
  sar_mobile_historial_de_pesajes: "historial.html",
  sar_mobile_ranking_de_recolectores: "ranking.html",
  sar_mobile_nuevo_pesaje_escanear_qr: "pesaje.html",
  sar_mobile_enviar_validaci_n_al_administrador: "validacion.html",
};

const base = "C:/Users/pablo/Downloads/stitch_sar (1)/stitch_sar";
const dest = "C:/Users/pablo/Projects/tracker/public/vista/movil";
const tag = '<script src="/vista/bind-movil.js"></script>';

for (const [folder, file] of Object.entries(map)) {
  let html = fs.readFileSync(path.join(base, folder, "code.html"), "utf8");
  if (!html.includes("bind-movil.js")) html = html.replace("</body></html>", `${tag}</body></html>`);
  fs.writeFileSync(path.join(dest, file), html);
  console.log(file, html.includes("Hola, Carlos") || html.includes("Mínimo"));
}

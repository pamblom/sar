const money = new Intl.NumberFormat("es-CO");

fetch("/api/sar/sesion").then(async (response) => {
  if (!response.ok) {
    location.replace("/vista/movil/login.html");
    return;
  }
  const data = await response.json();
  if (data.user?.rol === "Recolector") location.replace("/vista/movil/inicio.html");
});

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function rowHtml(person, index) {
  const doc = person.Numero_Documento ? `CC: ••••${String(person.Numero_Documento).slice(-4)}` : person.Zona || "";
  const rank = index === 0 ? "from-amber-500/20 to-yellow-500/30 text-amber-300 border-amber-500/40" : "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  const active = person.Estado_Cuenta === "Activo";
  return `<tr class="hover:bg-emerald-800/40 transition-colors" data-id="${person.ID_Usuario}">
    <td class="py-4 px-6 font-mono font-bold text-emerald-300">#${person.ID_Usuario}</td>
    <td class="py-4 px-6"><div class="flex items-center gap-3.5"><div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#123F36] to-[#2A6B5C] flex items-center justify-center font-bold text-white">${initials(person.Nombres + " " + person.Apellidos)}</div><div><span class="font-bold text-white block">${person.Nombres} ${person.Apellidos}</span><span class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">${person.material || "Sin material"}</span> <span class="text-[11px] text-emerald-200/70">${doc}</span></div></div></td>
    <td class="py-4 px-6 text-right"><div class="font-extrabold text-white">${money.format(Number(person.Puntos_Acumulados))} pts</div><div class="text-[11px] text-emerald-300">${Number(person.kilos).toLocaleString("es-CO")} kg entregados</div></td>
    <td class="py-4 px-6 text-center"><span class="inline-flex px-3 py-1 rounded-full border text-[11px] font-bold ${rank}">Rango ${person.Nivel}</span></td>
    <td class="py-4 px-6 text-center"><span class="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold ${active ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}">${person.Estado_Cuenta}</span></td>
    <td class="py-4 px-6 text-right"><div class="flex justify-end gap-1">
      <button data-act="ver" class="px-2 py-2 rounded-xl text-emerald-300" title="Ver">Ver</button>
      <button data-act="Suspendido" class="px-2 py-2 rounded-xl text-amber-300" title="Suspender">Susp.</button>
      <button data-act="Bloqueado" class="px-2 py-2 rounded-xl text-rose-300" title="Bloquear">Bloq.</button>
      <button data-act="Activo" class="px-2 py-2 rounded-xl text-emerald-200" title="Activar">Act.</button>
    </div></td>
  </tr>`;
}

async function load() {
  const modal = document.getElementById("collector-detail-modal");
  if (modal) modal.classList.add("hidden");
  window.toggleCollectorModal = (show) => modal?.classList.toggle("hidden", !show);
  const response = await fetch("/api/sar/recolectores");
  const data = await response.json();
  const total = document.getElementById("kpi-total");
  const activos = document.getElementById("kpi-activos");
  const material = document.getElementById("kpi-material");
  const puntos = document.getElementById("kpi-puntos");
  if (total) total.textContent = String(data.metrics.total);
  if (activos) activos.textContent = String(data.metrics.activos);
  if (material) material.textContent = data.metrics.predominante;
  if (puntos) puntos.textContent = money.format(Number(data.metrics.puntos));
  const badge = document.querySelector("span.bg-emerald-500\\/20.text-emerald-300.border");
  const body = document.getElementById("live-body");
  if (!body) return;
  const query = (document.querySelector('input[placeholder*="Buscar"]')?.value || "").toLowerCase();
  const people = data.people.filter((person) =>
    `${person.ID_Usuario} ${person.Nombres} ${person.Apellidos} ${person.Numero_Documento || ""}`.toLowerCase().includes(query),
  );
  body.innerHTML = people.map(rowHtml).join("") || `<tr><td class="px-6 py-6 text-emerald-200" colspan="6">No hay recolectores en la base SAR.</td></tr>`;
  const count = document.querySelector("span.bg-emerald-500\\/20.text-emerald-300.border.border-emerald-400\\/30");
  if (count && count.textContent.includes("Enrol")) count.textContent = `${people.length} enrolados`;
  body.onclick = async (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const id = Number(button.closest("tr").dataset.id);
    const person = data.people.find((item) => Number(item.ID_Usuario) === id);
    if (button.dataset.act === "ver" && person) {
      const modal = document.getElementById("collector-detail-modal");
      const title = modal?.querySelector("h3");
      const sub = modal?.querySelector("p");
      if (title) title.textContent = `${person.Nombres} ${person.Apellidos}`;
      if (sub) sub.textContent = `ID #${person.ID_Usuario} · ${person.Estado_Cuenta} · ${money.format(Number(person.Puntos_Acumulados))} pts`;
      if (typeof toggleCollectorModal === "function") toggleCollectorModal(true);
      return;
    }
    await fetch("/api/sar/recolectores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado: button.dataset.act }),
    });
    load();
  };
}

document.querySelector('input[placeholder*="Buscar"]')?.addEventListener("input", () => load());
load();

const viewNames = {
  Dashboard: "dashboard",
  Analíticas: "analiticas",
  Solicitudes: "solicitudes",
  Historial: "historial",
  "Ranking de Usuarios": "ranking",
  "Gestión de Usuarios": "usuarios",
  Materiales: "materiales",
  "Reporte Ambiental": "reporte",
};

const usuariosView = document.querySelector("main .max-w-\\[1600px\\]");
const stage = document.createElement("div");
stage.id = "view-stage";
stage.className = "relative mx-auto w-full max-w-[1600px] flex-col gap-6 p-6 lg:p-10";
stage.style.display = "none";
usuariosView?.parentElement?.appendChild(stage);

function setActive(link) {
  document.querySelectorAll("aside nav a").forEach((item) => {
    item.classList.remove("glass-nav-active", "text-white", "shadow-inner");
    item.classList.add("text-emerald-200/80", "border-transparent");
    item.querySelectorAll(".nav-pulse-dot").forEach((dot) => dot.remove());
  });
  link.classList.add("glass-nav-active", "text-white", "shadow-inner");
  link.classList.remove("text-emerald-200/80", "border-transparent");
  const dot = document.createElement("span");
  dot.className = "nav-pulse-dot ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#4ade80]";
  link.appendChild(dot);
}

function heading(title, text) {
  return `<div class="border-b border-white/10 pb-4"><p class="text-[11px] uppercase tracking-wider text-emerald-300/80">SAR</p><h1 class="mt-1 text-3xl font-semibold text-white">${title}</h1><p class="mt-1 text-sm text-emerald-200/70">${text}</p></div>`;
}

function card(label, value) {
  return `<article class="rounded-2xl border border-[#2A6B5C]/50 bg-[#123F36]/80 p-5"><p class="text-[11px] uppercase tracking-wider text-emerald-200/80">${label}</p><p class="mt-2 text-3xl font-extrabold text-white">${value}</p></article>`;
}

let panelCache = null;

async function panel() {
  if (panelCache) return panelCache;
  const response = await fetch("/api/sar/panel");
  panelCache = await response.json();
  const badge = document.querySelector("aside nav a span.bg-emerald-500\\/25");
  const pending = (panelCache.solicitudes || []).filter((item) => item.Estado === "Pendiente").length;
  if (badge) badge.textContent = String(pending);
  return panelCache;
}

async function decide(id, accion) {
  const motivo = accion === "denegar" ? prompt("Motivo del rechazo") : "";
  if (accion === "denegar" && !motivo) return;
  await fetch("/api/sar/panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accion, id, motivo }),
  });
  panelCache = null;
  show(document.querySelector("aside nav a.glass-nav-active")?.textContent?.trim().includes("Solicitud") ? "solicitudes" : "dashboard");
}

function solicitudRows(rows, withActions) {
  if (!rows.length) return `<p class="text-emerald-200/70">No hay registros.</p>`;
  return `<div class="overflow-x-auto rounded-2xl border border-[#2A6B5C]/40"><table class="w-full text-left text-sm"><thead class="text-[11px] uppercase text-emerald-200/80"><tr><th class="px-4 py-3">Código</th><th class="px-4 py-3">Recolector</th><th class="px-4 py-3">Material</th><th class="px-4 py-3">Kilos</th><th class="px-4 py-3">Puntos</th><th class="px-4 py-3">Estado</th><th class="px-4 py-3"></th></tr></thead><tbody>${rows
    .map(
      (item) => `<tr class="border-t border-white/5"><td class="px-4 py-3">${item.Codigo}</td><td class="px-4 py-3">${item.Recolector}</td><td class="px-4 py-3">${item.MaterialNombre}</td><td class="px-4 py-3">${item.Kilos}</td><td class="px-4 py-3">${item.PuntosEstimados}</td><td class="px-4 py-3">${item.Estado}</td><td class="px-4 py-3">${
        withActions && item.Estado === "Pendiente"
          ? `<button data-decide="aprobar" data-id="${item.ID_Solicitud}" class="mr-2 rounded-lg bg-emerald-400 px-3 py-1 text-xs font-bold text-[#081613]">Aprobar</button><button data-decide="denegar" data-id="${item.ID_Solicitud}" class="rounded-lg bg-rose-500/20 px-3 py-1 text-xs text-rose-200">Denegar</button>`
          : ""
      }</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}

async function show(name) {
  const users = name === "usuarios";
  if (usuariosView) usuariosView.style.display = users ? "" : "none";
  stage.style.display = users ? "none" : "flex";
  if (users) return;
  const data = await panel();
  const kilos = Number(data.metrics.kilos || 0).toLocaleString("es-CO");
  const pts = Number(data.metrics.puntos || 0).toLocaleString("es-CO");
  if (name === "dashboard") {
    const pending = data.solicitudes.filter((item) => item.Estado === "Pendiente");
    stage.innerHTML = `${heading("Dashboard", "Kilogramos, puntos y solicitudes de los últimos meses.")}<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${card("Kilogramos", kilos + " kg")}${card("Puntos", pts)}${card("Pendientes", String(pending.length))}${card("Recolectores", String(data.metrics.recolectores))}</section><h2 class="font-semibold text-white">Solicitudes pendientes</h2>${solicitudRows(pending, true)}`;
  } else if (name === "analiticas") {
    const max = Math.max(...data.metrics.porMaterial.map((item) => Number(item.kilos)), 1);
    stage.innerHTML = `${heading("Analíticas", "Volumen por material.")}${data.metrics.porMaterial
      .map(
        (item) => `<div><div class="mb-1 flex justify-between text-sm text-emerald-100"><span>${item.nombre}</span><span>${item.kilos} kg</span></div><div class="h-2 rounded-full bg-black/30"><div class="h-2 rounded-full bg-emerald-300" style="width:${(Number(item.kilos) / max) * 100}%"></div></div></div>`,
      )
      .join("")}`;
  } else if (name === "solicitudes") {
    stage.innerHTML = `${heading("Solicitudes", "Fila de pesajes enviados desde la app del recolector.")}${solicitudRows(data.solicitudes, true)}`;
  } else if (name === "historial") {
    stage.innerHTML = `${heading("Historial", "Pesajes registrados en la base SAR.")}${solicitudRows(data.solicitudes, false)}`;
  } else if (name === "ranking") {
    stage.innerHTML = `${heading("Ranking de usuarios", "Puntos acumulados de los recolectores.")}<ol class="space-y-2">${data.ranking
      .map(
        (item, index) => `<li class="flex justify-between rounded-xl bg-[#123F36]/80 px-4 py-3"><span>${index + 1}. ${item.Nombres} ${item.Apellidos}</span><strong class="text-emerald-300">${Number(item.Puntos_Acumulados).toLocaleString("es-CO")} pts</strong></li>`,
      )
      .join("")}</ol>`;
  } else if (name === "materiales") {
    const groups = {};
    for (const item of data.materiales) {
      const key = item.Categoria || "Otros";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    const cards = (items) =>
      items
        .map(
          (item) =>
            `<article data-material-card data-name="${item.Nombre.toLowerCase()}" class="rounded-xl bg-[#123F36]/80 px-4 py-3"><strong>${item.Nombre}</strong> <span class="text-emerald-200/70">${item.Categoria} · ${item.Subcategoria || "General"} · ${item.Puntos_por_Kg} pts/kg</span></article>`,
        )
        .join("");
    stage.innerHTML = `${heading("Materiales", "Cada categoría tiene subcategorías. En plástico, el tipo se identifica con el número de reciclaje.")}
      <div class="relative max-w-md">
        <input id="buscar-material" placeholder="Buscar por nombre" autocomplete="off" class="w-full rounded-xl bg-black/30 px-4 py-3">
        <ul id="lista-materiales" class="absolute z-20 mt-1 hidden max-h-64 w-full overflow-auto rounded-xl border border-emerald-500/30 bg-[#0c221d] shadow-xl"></ul>
      </div>
      <form id="nuevo-material" class="grid gap-2 rounded-2xl bg-[#123F36]/70 p-4 md:grid-cols-5">
        <input name="nombre" required placeholder="Nombre" class="rounded-lg bg-black/30 px-3 py-2">
        <select name="categoria" class="rounded-lg bg-black/30 px-3 py-2">
          <option>Plástico</option><option>Papel y cartón</option><option>Metal</option><option>Vidrio</option><option>Compuesto</option>
        </select>
        <input name="subcategoria" required placeholder="Subcategoría, ej. PET (1)" class="rounded-lg bg-black/30 px-3 py-2">
        <input name="puntos" type="number" step="0.01" required placeholder="Puntos/kg" class="rounded-lg bg-black/30 px-3 py-2">
        <button class="rounded-lg bg-emerald-400 font-bold text-[#081613]">Agregar</button>
      </form>
      <div id="catalogo" class="space-y-5">${Object.entries(groups)
        .map(
          ([categoria, items]) =>
            `<section data-group="${categoria}"><h2 class="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-300">${categoria}</h2><div class="space-y-2">${cards(items)}</div></section>`,
        )
        .join("")}</div>`;
    const search = stage.querySelector("#buscar-material");
    const list = stage.querySelector("#lista-materiales");
    const showMatches = () => {
      const query = search.value.trim().toLowerCase();
      const matches = data.materiales.filter((item) => !query || `${item.Nombre} ${item.Subcategoria || ""} ${item.Categoria}`.toLowerCase().includes(query));
      list.innerHTML = matches
        .slice(0, 12)
        .map(
          (item) =>
            `<li><button type="button" data-pick="${item.Nombre}" class="block w-full px-4 py-2 text-left hover:bg-emerald-500/15"><strong>${item.Nombre}</strong><span class="block text-xs text-emerald-200/70">${item.Categoria} · ${item.Subcategoria || "General"}</span></button></li>`,
        )
        .join("");
      list.classList.toggle("hidden", matches.length === 0);
      stage.querySelectorAll("[data-material-card]").forEach((card) => {
        card.classList.toggle("hidden", query && !card.dataset.name.includes(query));
      });
      stage.querySelectorAll("[data-group]").forEach((group) => {
        const visible = [...group.querySelectorAll("[data-material-card]")].some((card) => !card.classList.contains("hidden"));
        group.classList.toggle("hidden", !visible);
      });
    };
    search.addEventListener("focus", showMatches);
    search.addEventListener("input", showMatches);
    list.addEventListener("click", (event) => {
      const pick = event.target.closest("[data-pick]");
      if (!pick) return;
      search.value = pick.dataset.pick;
      showMatches();
      list.classList.add("hidden");
    });
    stage.querySelector("#nuevo-material")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      await fetch("/api/sar/panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "material",
          nombre: form.nombre.value,
          categoria: form.categoria.value,
          subcategoria: form.subcategoria.value,
          puntos: form.puntos.value,
          co2: 1,
        }),
      });
      panelCache = null;
      show("materiales");
    });
  } else if (name === "reporte") {
    stage.innerHTML = `${heading("Reporte ambiental", "Huella de los pesajes aprobados.")}${card("Huella acumulada", Number(data.metrics.huella || 0).toLocaleString("es-CO") + " kg CO₂")}<a class="inline-flex w-fit rounded-lg bg-emerald-400 px-4 py-2 font-bold text-[#081613]" href="/api/sar/pdf?tipo=reporte">Exportar PDF</a>`;
  }
  stage.onclick = (event) => {
    const button = event.target.closest("[data-decide]");
    if (!button) return;
    decide(Number(button.dataset.id), button.dataset.decide);
  };
}

document.querySelectorAll("button").forEach((button) => {
  if (!/Exportar PDF/i.test(button.textContent || "")) return;
  button.addEventListener("click", () => {
    window.location.href = "/api/sar/pdf?tipo=recolectores";
  });
});

document.querySelectorAll("aside nav a").forEach((link) => {
  const label = link.querySelector("span:not([class*='rounded'])")?.textContent?.trim() || link.textContent.trim();
  const key = Object.keys(viewNames).find((name) => label.includes(name));
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (!key) return;
    setActive(link);
    show(viewNames[key]);
  });
  if (key === "usuarios") setActive(link);
});


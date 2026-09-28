const page = location.pathname.split("/").pop() || "";

function go(file) {
  location.href = `/vista/movil/${file}`;
}

document.querySelectorAll("[data-path]").forEach((link) => {
  const path = link.getAttribute("data-path");
  const files = { inicio: "inicio.html", historial: "historial.html", ranking: "ranking.html", perfil: "inicio.html" };
  if (files[path]) link.setAttribute("href", `/vista/movil/${files[path]}`);
});

const scan = document.getElementById("scanQrBtn");
if (scan) scan.addEventListener("click", () => go("pesaje.html"));

const create = [...document.querySelectorAll("button")].find((button) => /crear cuenta/i.test(button.textContent || ""));
if (create && page.startsWith("login")) create.addEventListener("click", () => go("registro.html"));

const capture = [...document.querySelectorAll("button")].find((button) => /capturar código/i.test(button.textContent || ""));
if (capture) {
  capture.addEventListener("click", () => go("validacion.html"));
}

const form = document.getElementById("sar-login-form");
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const correo = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const response = await fetch("/api/sar/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "No se pudo entrar");
      return;
    }
    if (data.rol === "Admin") location.href = "/vista/admin.html";
    else go("inicio.html");
  });
}

const registerButton = document.getElementById("submit-register-btn");
if (registerButton) {
  registerButton.addEventListener("click", async () => {
    const response = await fetch("/api/sar/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombres: document.getElementById("reg-first-name").value,
        apellidos: document.getElementById("reg-last-name").value,
        correo: document.getElementById("reg-email").value,
        telefono: document.getElementById("reg-phone").value,
        password: document.getElementById("reg-password").value,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "No se pudo registrar");
      return;
    }
    go("inicio.html");
  });
}

async function session() {
  const response = await fetch("/api/sar/sesion");
  if (response.status === 401) {
    if (!page.startsWith("login") && !page.startsWith("registro")) go("login.html");
    return null;
  }
  return response.json();
}

function fillInicio(data) {
  const hello = [...document.querySelectorAll("span,h1")].find((node) => (node.textContent || "").includes("Hola,"));
  if (hello) hello.textContent = `Hola, ${data.user.nombres}`;
  const score = [...document.querySelectorAll("span")].find((node) => (node.textContent || "").includes("12,500") || (node.textContent || "").trim() === String(data.user.puntos));
  const big = document.querySelector(".font-display-mobile, [class*='text-display']");
  if (big) big.textContent = Number(data.user.puntos).toLocaleString("es-CO");
  else if (score) score.textContent = Number(data.user.puntos).toLocaleString("es-CO");
}

function fillLista(data) {
  const host = document.querySelector("main");
  if (!host || !data.pesajes) return;
  const box = document.createElement("section");
  box.style.margin = "16px";
  box.innerHTML = data.pesajes
    .map(
      (item) => `<article style="margin-bottom:10px;padding:12px;border-radius:16px;background:#101e1b">
        <strong>${item.MaterialNombre}</strong> · ${item.Kilos} kg
        <div style="color:#93d3c1">${item.Estado} · ${item.Codigo} · +${item.PuntosEstimados} pts</div>
      </article>`,
    )
    .join("");
  host.appendChild(box);
}

const send = [...document.querySelectorAll("button")].find((button) => /enviar solicitud/i.test(button.textContent || ""));
if (send) {
  send.addEventListener("click", async () => {
    const response = await fetch("/api/sar/pesajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kilos: 15, material: "pet" }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "No se envió");
      return;
    }
    alert(`Solicitud ${data.codigo} enviada. ${data.kilos} kg de ${data.material}, ${data.puntos} pts estimados.`);
    go("historial.html");
  });
}

session().then((data) => {
  if (!data) return;
  if (page.startsWith("inicio")) fillInicio(data);
  if (page.startsWith("historial")) fillLista(data);
  if (page.startsWith("ranking") && data.ranking) {
    const host = document.querySelector("main");
    const box = document.createElement("section");
    box.style.margin = "16px";
    box.innerHTML = (data.ranking || [])
      .map(
        (item, index) =>
          `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1f2d29"><span>${index + 1}. ${item.Nombres} ${item.Apellidos}</span><strong style="color:#4bddb5">${item.Puntos_Acumulados}</strong></div>`,
      )
      .join("");
    host?.appendChild(box);
  }
});

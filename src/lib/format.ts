import type { EstadoCuenta, EstadoSolicitud } from "./types";

export const ZONAS = ["Centro", "Manga", "Bocagrande", "Getsemaní", "La Boquilla"] as const;

export const NIVELES = [
  { nivel: 1, nombre: "Brote", min: 0 },
  { nivel: 2, nombre: "Pino Silvestre", min: 500 },
  { nivel: 3, nombre: "Roble Centenario", min: 1500 },
  { nivel: 4, nombre: "Ceiba", min: 3500 },
] as const;

export function nivelDesdePuntos(puntos: number) {
  let actual: (typeof NIVELES)[number] = NIVELES[0];
  for (const nivel of NIVELES) {
    if (puntos >= nivel.min) actual = nivel;
  }
  const siguiente = NIVELES.find((item) => item.min > actual.min);
  const progreso = siguiente
    ? Math.min(100, ((puntos - actual.min) / (siguiente.min - actual.min)) * 100)
    : 100;
  return { ...actual, siguiente: siguiente?.nombre ?? "Máximo", faltan: siguiente ? siguiente.min - puntos : 0, progreso };
}

export function fullName(nombres: string, apellidos: string) {
  return `${nombres} ${apellidos}`.trim();
}

export function formatKg(value: number) {
  return `${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 2 })} kg`;
}

export function formatPts(value: number) {
  return Number(value).toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

export function formatCo2(value: number) {
  return `${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 2 })} kg CO₂`;
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export function estadoLabel(estado: EstadoSolicitud | EstadoCuenta) {
  return estado;
}

export function nextCodigo(last?: string | null) {
  const match = last?.match(/SAR-(\d{4})-(\d+)/);
  const year = new Date().getFullYear();
  const n = match ? Number(match[2]) + 1 : 1;
  return `SAR-${year}-${String(n).padStart(5, "0")}`;
}

export function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score += 1;
  const labels = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte", "Excelente"];
  return { score, label: labels[score], percent: (score / 5) * 100 };
}

import type { Material } from "./types";

export function reconocerMaterial(nombreArchivo: string, materiales: Material[]) {
  const activos = materiales.filter((item) => item.Estado === "Activo");
  if (activos.length === 0) {
    return { material: null as Material | null, fidelidad: 0 };
  }

  const file = nombreArchivo.toLowerCase();
  const reglas: { keys: string[]; categoria: string }[] = [
    { keys: ["pet", "botella", "plast"], categoria: "Plástico" },
    { keys: ["carton", "cartón", "caja", "papel"], categoria: "Papel y cartón" },
    { keys: ["aluminio", "lata", "metal", "chatarra"], categoria: "Metal" },
    { keys: ["vidrio", "botella-verde", "glass"], categoria: "Vidrio" },
    { keys: ["tetra", "envase"], categoria: "Compuesto" },
  ];

  const regla = reglas.find((item) => item.keys.some((key) => file.includes(key)));
  const candidatos = regla ? activos.filter((item) => item.Categoria === regla.categoria) : activos;
  const elegido = candidatos[hashIndex(file, candidatos.length)] ?? activos[0];
  const fidelidad = regla ? 88 + (hashIndex(file, 10) % 10) : 62 + (hashIndex(file, 20) % 18);
  return { material: elegido, fidelidad: Number(Math.min(99.9, fidelidad).toFixed(1)) };
}

function hashIndex(value: string, size: number) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) total += value.charCodeAt(i);
  return size === 0 ? 0 : total % size;
}

export function telemetriaBascula(zona: string, kilos: number) {
  const codigo = zona.slice(0, 3).toUpperCase();
  return `Báscula óptica ${codigo}-0${(kilos % 7) + 1} · ${kilos.toFixed(2)} kg`;
}

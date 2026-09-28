export const colors = {
  bg: "#081613",
  low: "#101e1b",
  card: "#14221f",
  high: "#1f2d29",
  highest: "#293834",
  lowest: "#04110e",
  text: "#d6e6e0",
  muted: "#bfc9c4",
  sage: "#9cc4b8",
  mint: "#4bddb5",
  primary: "#93d3c1",
  pine: "#2a6b5c",
  onMint: "#00382b",
  error: "#ffb4ab",
};

export const levels = [
  { nivel: 1, nombre: "Brote", min: 0 },
  { nivel: 2, nombre: "Pino Silvestre", min: 500 },
  { nivel: 3, nombre: "Roble Centenario", min: 1500 },
  { nivel: 4, nombre: "Ceiba", min: 3500 },
];

export function rankFromPoints(points: number) {
  let current = levels[0];
  for (const level of levels) {
    if (points >= level.min) current = level;
  }
  const next = levels.find((item) => item.min > current.min);
  const progress = next ? Math.min(100, ((points - current.min) / (next.min - current.min)) * 100) : 100;
  return {
    ...current,
    nextName: next?.nombre ?? "Máximo",
    missing: next ? next.min - points : 0,
    progress,
  };
}

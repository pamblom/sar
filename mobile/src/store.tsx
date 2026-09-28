import { createContext, useContext, useMemo, useState } from "react";
import { rankFromPoints } from "./theme";

export type Weighing = {
  id: string;
  material: string;
  kilos: number;
  points: number;
  status: "Pendiente" | "Aprobada" | "Denegada";
  zone: string;
  fidelity: number;
  createdAt: string;
};

export type Account = {
  nombres: string;
  apellidos: string;
  correo: string;
  password: string;
  telefono: string;
  zona: string;
  puntos: number;
};

export type Session = Omit<Account, "password">;

const seedAccounts: Account[] = [
  {
    nombres: "Jean Carlos",
    apellidos: "Saldaña",
    correo: "jean.saldana@sar.local",
    password: "sar2026",
    telefono: "3004445566",
    zona: "La Boquilla",
    puntos: 1860,
  },
  {
    nombres: "Carlos",
    apellidos: "Pérez",
    correo: "carlos.perez@sar.local",
    password: "sar2026",
    telefono: "3006667788",
    zona: "Centro",
    puntos: 12500,
  },
];

const seedWeighings: Weighing[] = [
  { id: "SAR-98421", material: "Plástico PET", kilos: 12, points: 540, status: "Aprobada", zone: "Centro Norte", fidelity: 96, createdAt: "24/09 · 10:30 AM" },
  { id: "SAR-98394", material: "Cartón corrugado", kilos: 20, points: 400, status: "Aprobada", zone: "Manga", fidelity: 91, createdAt: "24/09 · 09:15 AM" },
  { id: "SAR-98201", material: "Metales", kilos: 5, points: 140, status: "Pendiente", zone: "Tolva 03", fidelity: 62, createdAt: "23/09 · 04:45 PM" },
  { id: "SAR-98150", material: "Plástico PET", kilos: 8, points: 360, status: "Aprobada", zone: "Bocagrande", fidelity: 94, createdAt: "23/09 · 02:20 PM" },
];

const board = [
  { name: "Ana García", points: 9200, kilos: 98, level: "Pino" },
  { name: "Carlos Pérez", points: 12500, kilos: 145, level: "Roble" },
  { name: "Juan P.", points: 8850, kilos: 105, level: "Pino" },
  { name: "Luis Sánchez", points: 5400, kilos: 60, level: "Brote" },
  { name: "María López", points: 4100, kilos: 45, level: "Brote" },
  { name: "Pedro Torres", points: 3800, kilos: 40, level: "Brote" },
  { name: "Valentina R.", points: 3450, kilos: 36, level: "Brote" },
  { name: "Diego Morales", points: 2920, kilos: 28, level: "Semilla" },
];

type Store = {
  session: Session | null;
  weighings: Weighing[];
  login: (correo: string, password: string) => string | null;
  register: (input: Omit<Account, "puntos">) => string | null;
  logout: () => void;
  addWeighing: (input: { material: string; kilos: number; fidelity: number }) => Weighing;
  ranking: { name: string; points: number; kilos: number; level: string; mine: boolean }[];
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState(seedAccounts);
  const [session, setSession] = useState<Session | null>(null);
  const [weighings, setWeighings] = useState(seedWeighings);

  const value = useMemo<Store>(() => {
    const ranking = [
      ...board,
      ...(session
        ? [{ name: `${session.nombres} ${session.apellidos}`, points: session.puntos, kilos: 42, level: rankFromPoints(session.puntos).nombre }]
        : []),
    ]
      .sort((a, b) => b.points - a.points)
      .filter((item, index, list) => list.findIndex((other) => other.name === item.name) === index)
      .map((item) => ({
        ...item,
        mine: session ? item.name.startsWith(session.nombres) : false,
      }));

    return {
      session,
      weighings,
      ranking,
      login(correo, password) {
        const found = accounts.find((item) => item.correo.toLowerCase() === correo.trim().toLowerCase());
        if (!found || found.password !== password) return "Correo o contraseña incorrectos.";
        const { password: _password, ...safe } = found;
        setSession(safe);
        return null;
      },
      register(input) {
        if (accounts.some((item) => item.correo.toLowerCase() === input.correo.toLowerCase())) {
          return "Ese correo ya está registrado.";
        }
        if (input.password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
        const account = { ...input, puntos: 0 };
        setAccounts((current) => [...current, account]);
        const { password: _password, ...safe } = account;
        setSession(safe);
        return null;
      },
      logout() {
        setSession(null);
      },
      addWeighing(input) {
        const points = Math.round(input.kilos * 12);
        const created: Weighing = {
          id: `SAR-${Math.floor(100000 + Math.random() * 899999)}`,
          material: input.material,
          kilos: input.kilos,
          points,
          status: "Pendiente",
          zone: session?.zona ?? "Centro",
          fidelity: input.fidelity,
          createdAt: "Ahora",
        };
        setWeighings((current) => [created, ...current]);
        return created;
      },
    };
  }, [accounts, session, weighings]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("Store no disponible");
  return store;
}

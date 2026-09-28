export type AuthStack = {
  Login: undefined;
  Registro: undefined;
};

export type TabStack = {
  Inicio: undefined;
  Historial: undefined;
  Ranking: undefined;
  Perfil: undefined;
};

export type AppStack = {
  Tabs: undefined;
  Pesaje: undefined;
  Confirmar: { kilos: number; material: string; fidelity: number };
};

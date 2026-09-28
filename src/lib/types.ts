export type Rol = "Admin" | "Recolector" | "Operador";
export type EstadoCuenta = "Activo" | "Bloqueado" | "Suspendido" | "Vetado";
export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Denegada";

export type Usuario = {
  ID_Usuario: number;
  Rol: Rol;
  Nombres: string;
  Apellidos: string;
  Correo: string;
  Password_Hash: string;
  Nivel: number;
  Puntos_Acumulados: number;
  Estado_Cuenta: EstadoCuenta;
  Fecha_Registro: string;
  Fecha_Nacimiento: string | null;
  Telefono: string | null;
  Tipo_Documento: string | null;
  Numero_Documento: string | null;
  Codigo_Admin: string | null;
  PIN_Respaldo: string | null;
  Zona: string | null;
  Lugar_Acopio: string | null;
  Two_Factor: number;
  Alertas_Sonoras: number;
  Tema: string | null;
};

export type Material = {
  ID_Material: number;
  Nombre: string;
  Categoria: string;
  Impacto_Huella_Carbono: number;
  Puntos_por_Kg: number;
  Estado: "Activo" | "Inactivo";
};

export type Solicitud = {
  ID_Solicitud: number;
  Codigo: string;
  ID_Recolector: number;
  ID_Material: number;
  ID_Operador: number | null;
  Kilos: number;
  Foto_URL: string | null;
  IA_Fidelidad_Reconocimiento: number | null;
  Bascula_Telemetria: string | null;
  Estado: EstadoSolicitud;
  Motivo_Rechazo: string | null;
  Comentario_Rechazo: string | null;
  Zona: string | null;
  Manifiesto: string | null;
  Fecha_Creacion: string;
  Fecha_Validacion: string | null;
};

export type SolicitudVista = Solicitud & {
  Recolector: string;
  NivelRecolector: number;
  MaterialNombre: string;
  Categoria: string;
  PuntosEstimados: number;
  Huella: number;
};

export type RankingRow = {
  ID_Usuario: number;
  Nombres: string;
  Apellidos: string;
  Zona: string | null;
  Nivel: number;
  Puntos_Acumulados: number;
  Kilos: number;
};

export type Notificacion = {
  ID_Notificacion: number;
  ID_Usuario: number;
  Titulo: string;
  Mensaje: string;
  Leida: number;
  Fecha: string;
};

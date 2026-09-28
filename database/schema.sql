-- SAR_DB adaptado a SQLite (origen: SAR.sql SQL Server)
-- Tablas núcleo del documento + campos de RF-07 a RF-20

CREATE TABLE IF NOT EXISTS Usuarios (
    ID_Usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    Rol TEXT NOT NULL CHECK (Rol IN ('Admin', 'Recolector', 'Operador')),
    Nombres TEXT NOT NULL,
    Apellidos TEXT NOT NULL,
    Correo TEXT UNIQUE NOT NULL,
    Password_Hash TEXT NOT NULL,
    Nivel INTEGER DEFAULT 1,
    Puntos_Acumulados REAL DEFAULT 0.00,
    Estado_Cuenta TEXT DEFAULT 'Activo' CHECK (Estado_Cuenta IN ('Activo', 'Bloqueado', 'Suspendido', 'Vetado')),
    Fecha_Registro TEXT DEFAULT (datetime('now')),
    Fecha_Nacimiento TEXT,
    Telefono TEXT,
    Tipo_Documento TEXT,
    Numero_Documento TEXT,
    Codigo_Admin TEXT,
    PIN_Respaldo TEXT,
    Zona TEXT DEFAULT 'Centro',
    Lugar_Acopio TEXT DEFAULT 'Centro de acopio Manga',
    Two_Factor INTEGER DEFAULT 0,
    Alertas_Sonoras INTEGER DEFAULT 1,
    Tema TEXT DEFAULT 'esmeralda'
);

CREATE TABLE IF NOT EXISTS Materiales (
    ID_Material INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    Categoria TEXT NOT NULL,
    Impacto_Huella_Carbono REAL NOT NULL,
    Puntos_por_Kg REAL NOT NULL,
    Estado TEXT DEFAULT 'Activo' CHECK (Estado IN ('Activo', 'Inactivo'))
);

CREATE TABLE IF NOT EXISTS Solicitudes_Pesaje (
    ID_Solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
    Codigo TEXT UNIQUE NOT NULL,
    ID_Recolector INTEGER NOT NULL,
    ID_Material INTEGER NOT NULL,
    ID_Operador INTEGER,
    Kilos REAL NOT NULL CHECK (Kilos > 0),
    Foto_URL TEXT,
    IA_Fidelidad_Reconocimiento REAL CHECK (IA_Fidelidad_Reconocimiento BETWEEN 0 AND 100),
    Bascula_Telemetria TEXT,
    Estado TEXT DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobada', 'Denegada')),
    Motivo_Rechazo TEXT,
    Comentario_Rechazo TEXT,
    Zona TEXT DEFAULT 'Centro',
    Manifiesto TEXT,
    Fecha_Creacion TEXT DEFAULT (datetime('now')),
    Fecha_Validacion TEXT,
    FOREIGN KEY (ID_Recolector) REFERENCES Usuarios(ID_Usuario),
    FOREIGN KEY (ID_Material) REFERENCES Materiales(ID_Material),
    FOREIGN KEY (ID_Operador) REFERENCES Usuarios(ID_Usuario)
);

CREATE TABLE IF NOT EXISTS Historial_Ranking (
    ID_Transaccion INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Recolector INTEGER NOT NULL,
    ID_Solicitud INTEGER NOT NULL,
    Puntos_Acreditados REAL NOT NULL,
    Fecha_Asignacion TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ID_Recolector) REFERENCES Usuarios(ID_Usuario),
    FOREIGN KEY (ID_Solicitud) REFERENCES Solicitudes_Pesaje(ID_Solicitud)
);

CREATE TABLE IF NOT EXISTS Notificaciones (
    ID_Notificacion INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Usuario INTEGER NOT NULL,
    Titulo TEXT NOT NULL,
    Mensaje TEXT NOT NULL,
    Leida INTEGER DEFAULT 0,
    Fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);

CREATE TABLE IF NOT EXISTS Auditoria_Sesion (
    ID_Evento INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Usuario INTEGER NOT NULL,
    Accion TEXT NOT NULL,
    Detalle TEXT,
    Fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);

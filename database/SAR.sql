-- Creación de la base de datos
CREATE DATABASE SAR_DB;
GO
USE SAR_DB;
GO

-- 1. Tabla de Usuarios (Administradores, Recolectores y Operadores)
CREATE TABLE Usuarios (
    ID_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Rol VARCHAR(20) NOT NULL CHECK (Rol IN ('Admin', 'Recolector', 'Operador')),
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Correo VARCHAR(150) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    Nivel INT DEFAULT 1,
    Puntos_Acumulados DECIMAL(10,2) DEFAULT 0.00,
    Estado_Cuenta VARCHAR(20) DEFAULT 'Activo' CHECK (Estado_Cuenta IN ('Activo', 'Bloqueado', 'Suspendido', 'Vetado')),
    Fecha_Registro DATETIME DEFAULT GETDATE()
);
GO

-- 2. Tabla de Materiales (Base para la IA y analíticas)
CREATE TABLE Materiales (
    ID_Material INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Impacto_Huella_Carbono DECIMAL(8,4) NOT NULL, -- Ej: Kg de CO2 ahorrados por Kg de material
    Puntos_por_Kg DECIMAL(8,2) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Activo' CHECK (Estado IN ('Activo', 'Inactivo'))
);
GO

-- 3. Tabla de Solicitudes de Pesaje (Transaccional principal)
CREATE TABLE Solicitudes_Pesaje (
    ID_Solicitud INT IDENTITY(1,1) PRIMARY KEY,
    ID_Recolector INT NOT NULL,
    ID_Material INT NOT NULL,
    Kilos DECIMAL(8,2) NOT NULL CHECK (Kilos > 0),
    Foto_URL VARCHAR(500), -- Ruta del archivo en el Cloud Storage
    IA_Fidelidad_Reconocimiento DECIMAL(5,2) CHECK (IA_Fidelidad_Reconocimiento BETWEEN 0 AND 100), 
    Bascula_Telemetria VARCHAR(100), 
    Estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobada', 'Denegada')),
    Motivo_Rechazo VARCHAR(255),
    Fecha_Creacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Solicitud_Recolector FOREIGN KEY (ID_Recolector) REFERENCES Usuarios(ID_Usuario),
    CONSTRAINT FK_Solicitud_Material FOREIGN KEY (ID_Material) REFERENCES Materiales(ID_Material)
);
GO

-- 4. Tabla de Historial y Ranking (Trazabilidad de puntos)
CREATE TABLE Historial_Ranking (
    ID_Transaccion INT IDENTITY(1,1) PRIMARY KEY,
    ID_Recolector INT NOT NULL,
    ID_Solicitud INT NOT NULL,
    Puntos_Acreditados DECIMAL(10,2) NOT NULL,
    Fecha_Asignacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Historial_Recolector FOREIGN KEY (ID_Recolector) REFERENCES Usuarios(ID_Usuario),
    CONSTRAINT FK_Historial_Solicitud FOREIGN KEY (ID_Solicitud) REFERENCES Solicitudes_Pesaje(ID_Solicitud)
);
GO
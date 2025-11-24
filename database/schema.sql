CREATE DATABASE NexusCode_2;
GO
USE NexusCode_2;
GO

/*===========================================================
=          1. CATÁLOGOS PARA ESTANDARIZACIÓN               =
===========================================================*/

CREATE TABLE Cat_TipoProveedor (
    TipoProveedorID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE   -- Material, Maquinaria, Varios
);

CREATE TABLE Cat_TipoIngreso (
    TipoIngresoID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE   -- Anticipo, Estimación, Aporte Interno
);

CREATE TABLE Cat_CategoriaGasto (
    CategoriaID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE   -- Mano de Obra, Servicios, Viaticos, Fianzas
);

CREATE TABLE Cat_TipoRetencion (
    TipoRetencionID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE   -- REPSE, IMSS, Garantía
);

CREATE TABLE Cat_Estatus (
    EstatusID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(30) NOT NULL UNIQUE   -- Activa, Cerrada, Recuperada, Baja
);

------------------------------------------------------------
-- Insertar información base
------------------------------------------------------------

INSERT INTO Cat_TipoProveedor VALUES ('Material'), ('Maquinaria'), ('Varios');
INSERT INTO Cat_TipoIngreso VALUES ('Aporte Interno'), ('Anticipo'), ('Estimación');
INSERT INTO Cat_CategoriaGasto VALUES ('Mano de Obra'), ('Servicios'), ('Viaticos'), ('Fianzas'), ('Penalizacion');
INSERT INTO Cat_TipoRetencion VALUES ('Falta REPSE'), ('Falta IMSS'), ('Garantía');
INSERT INTO Cat_Estatus VALUES ('Activa'), ('Cerrada'), ('Recuperada'), ('Baja');



/*===========================================================
=                   2. CLIENTES Y PROVEEDORES              =
===========================================================*/

CREATE TABLE Cliente (
  ClienteID       INT IDENTITY(1,1) PRIMARY KEY,
  Nombre          NVARCHAR(120) NOT NULL,
  RFC             NVARCHAR(13)  NULL,
  Telefono        NVARCHAR(30)  NULL,
  Correo          NVARCHAR(120) NULL
);

CREATE TABLE Proveedor (
  ProveedorID      INT IDENTITY(1,1) PRIMARY KEY,
  Nombre           NVARCHAR(120) NOT NULL,
  RFC              NVARCHAR(13)  NULL,
  TipoProveedorID  INT NOT NULL,
  Telefono         NVARCHAR(30) NULL,
  Correo           NVARCHAR(120) NULL,

  CONSTRAINT FK_Prov_Tipo FOREIGN KEY (TipoProveedorID)
      REFERENCES Cat_TipoProveedor(TipoProveedorID)
);



/*===========================================================
=                      3. PROYECTOS (OBRAS)                =
===========================================================*/

CREATE TABLE Obra (
  ObraID          INT IDENTITY(1,1) PRIMARY KEY,
  ClienteID       INT NOT NULL,
  Nombre          NVARCHAR(150) NOT NULL,
  Ubicacion       NVARCHAR(200) NULL,
  FechaInicio     DATE NULL,
  FechaFin        DATE NULL,
  EstatusID       INT NOT NULL DEFAULT 1, -- Activa
  CentroCostos    NVARCHAR(50) NULL,
  MontoContrato   DECIMAL(18,2) NOT NULL DEFAULT 0,
  Descripcion     NVARCHAR(MAX) NULL,
  NumeroContrato  NVARCHAR(100) NULL,
  Responsable     NVARCHAR(150) NULL,
  NotasAdicionales NVARCHAR(MAX) NULL,

  CONSTRAINT FK_Obra_Cliente FOREIGN KEY (ClienteID) REFERENCES Cliente(ClienteID),
  CONSTRAINT FK_Obra_Estatus FOREIGN KEY (EstatusID) REFERENCES Cat_Estatus(EstatusID),

  -- Validación lógica
  CONSTRAINT CK_Obra_Fechas CHECK (FechaFin IS NULL OR FechaFin >= FechaInicio)
);



/*===========================================================
=       4. TABLAS DE MOVIMIENTOS (Ingresos y Gastos)       =
===========================================================*/

-- INGRESOS
CREATE TABLE Ingreso (
  IngresoID       INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  Fecha           DATE NOT NULL,
  TipoIngresoID   INT NOT NULL,
  Descripcion     NVARCHAR(200) NOT NULL,
  Monto           DECIMAL(18,2) NOT NULL,
  FacturaRef      NVARCHAR(50) NULL,

  CONSTRAINT FK_Ingreso_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE,
  CONSTRAINT FK_Ingreso_Tipo FOREIGN KEY (TipoIngresoID) REFERENCES Cat_TipoIngreso(TipoIngresoID)
);


-- COMPRA MATERIALES
CREATE TABLE CompraMaterial (
  CompraID        INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  ProveedorID     INT NOT NULL,
  Fecha           DATE NOT NULL,
  FolioFactura    NVARCHAR(60) NULL,
  TotalCompra     DECIMAL(18,2) NOT NULL,

  CONSTRAINT FK_Compra_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE,
  CONSTRAINT FK_Compra_Proveedor FOREIGN KEY (ProveedorID) REFERENCES Proveedor(ProveedorID)
);

-- DETALLE MATERIALES
CREATE TABLE CompraMaterialDetalle (
  DetalleID       INT IDENTITY(1,1) PRIMARY KEY,
  CompraID        INT NOT NULL,
  MaterialNombre  NVARCHAR(100) NOT NULL,
  Cantidad        DECIMAL(18,2) NOT NULL,
  Unidad          NVARCHAR(20) NOT NULL,
  PrecioUnitario  DECIMAL(18,2) NOT NULL,
  Subtotal        AS (Cantidad * PrecioUnitario) PERSISTED,

  CONSTRAINT FK_Detalle_Compra FOREIGN KEY (CompraID)
      REFERENCES CompraMaterial(CompraID) ON DELETE CASCADE
);


-- RENTA MAQUINARIA
CREATE TABLE RentaMaquinaria (
  RentaID         INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  ProveedorID     INT NOT NULL,
  Descripcion     NVARCHAR(150) NOT NULL,
  FechaInicio     DATE NOT NULL,
  FechaFin        DATE NULL,
  CostoTotal      DECIMAL(18,2) NOT NULL,

  CONSTRAINT FK_Renta_Obra      FOREIGN KEY (ObraID)      REFERENCES Obra(ObraID) ON DELETE CASCADE,
  CONSTRAINT FK_Renta_Proveedor FOREIGN KEY (ProveedorID) REFERENCES Proveedor(ProveedorID)
);


-- GASTOS GENERALES
CREATE TABLE GastoGeneral (
  GastoID         INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  Fecha           DATE NOT NULL,
  CategoriaID     INT NOT NULL,
  Descripcion     NVARCHAR(200) NOT NULL,
  ProveedorID     INT NULL,
  Monto           DECIMAL(18,2) NOT NULL,
  FacturaRef      NVARCHAR(50) NULL,

  CONSTRAINT FK_Gasto_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE,
  CONSTRAINT FK_Gasto_Prov FOREIGN KEY (ProveedorID) REFERENCES Proveedor(ProveedorID),
  CONSTRAINT FK_Gasto_Cat FOREIGN KEY (CategoriaID) REFERENCES Cat_CategoriaGasto(CategoriaID)
);



-- RETENCIONES
CREATE TABLE Retencion (
  RetencionID     INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  TipoRetencionID INT NOT NULL,
  Fecha           DATE NOT NULL,
  Monto           DECIMAL(18,2) NOT NULL,
  EstatusID       INT NOT NULL DEFAULT 1,

  CONSTRAINT FK_Ret_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE,
  CONSTRAINT FK_Ret_Tipo FOREIGN KEY (TipoRetencionID) REFERENCES Cat_TipoRetencion(TipoRetencionID),
  CONSTRAINT FK_Ret_Estado FOREIGN KEY (EstatusID) REFERENCES Cat_Estatus(EstatusID)
);



/*===========================================================
=                5. TABLAS DE TRABAJADORES                 =
===========================================================*/

CREATE TABLE Trabajador (
  TrabajadorID    INT IDENTITY(1,1) PRIMARY KEY,
  NombreCompleto  NVARCHAR(150) NOT NULL,
  Puesto          NVARCHAR(100) NULL,
  NSS             NVARCHAR(20) NULL,
  CodigoEmpleado  NVARCHAR(50) NULL UNIQUE,
  Correo          NVARCHAR(120) NULL,
  RFC             NVARCHAR(13) NULL,
  Direccion       NVARCHAR(MAX) NULL,
  CuentaBancaria  NVARCHAR(50) NULL,
  FechaIngreso    DATE NULL,
  FechaTerminacion DATE NULL,
  INERuta         NVARCHAR(MAX) NULL,
  EstatusID       INT NOT NULL DEFAULT 1,
  CONSTRAINT FK_Trab_Estatus FOREIGN KEY (EstatusID) REFERENCES Cat_Estatus(EstatusID)
);


CREATE TABLE TrabajadorObra (
  TrabajadorObraID INT IDENTITY(1,1) PRIMARY KEY,
  TrabajadorID     INT NOT NULL,
  ObraID           INT NOT NULL,
  FechaAsignacion  DATE DEFAULT GETDATE(),
  FechaFin         DATE NULL,
  
  CONSTRAINT FK_TrabOb_Trab FOREIGN KEY (TrabajadorID) REFERENCES Trabajador(TrabajadorID) ON DELETE CASCADE,
  CONSTRAINT FK_TrabOb_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE,
  CONSTRAINT UQ_TrabOb UNIQUE (TrabajadorID, ObraID)
);


CREATE TABLE PagoNomina (
  NominaID        INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  TrabajadorID    INT NOT NULL,
  FechaPago       DATE NOT NULL,
  MontoPagado     DECIMAL(18,2) NOT NULL,

  CONSTRAINT FK_Nomina_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE,
  CONSTRAINT FK_Nomina_Trab FOREIGN KEY (TrabajadorID) REFERENCES Trabajador(TrabajadorID)
);


CREATE TABLE ReporteAvance (
  AvanceID        INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  FechaReporte    DATE NOT NULL,
  PorcentajeFisico DECIMAL(5,2) NOT NULL,
  Observaciones   NVARCHAR(MAX) NULL,

  CONSTRAINT FK_Avance_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE
);

-- ARCHIVOS DE OBRA (Contratos, Planos, Imágenes)
CREATE TABLE ObraArchivo (
  ArchivoID       INT IDENTITY(1,1) PRIMARY KEY,
  ObraID          INT NOT NULL,
  TipoArchivo     NVARCHAR(50) NOT NULL, -- 'Contrato', 'Planos', 'Imagenes'
  NombreArchivo   NVARCHAR(255) NOT NULL,
  RutaArchivo     NVARCHAR(MAX) NOT NULL,
  TamanoBytes     BIGINT NULL,
  FechaCreacion   DATETIME DEFAULT GETDATE(),
  
  CONSTRAINT FK_Archivo_Obra FOREIGN KEY (ObraID) REFERENCES Obra(ObraID) ON DELETE CASCADE
);


/*===========================================================
=      1. ACTUALIZACIÓN DE TABLA: TRABAJADOR               =
=  Se agregan datos fiscales, bancarios e identificación   =
===========================================================*/

ALTER TABLE Trabajador
ADD 
    ClaveEmpleado   VARCHAR(20) NULL,    -- Ej: EMP-001
    ApellidoPaterno NVARCHAR(60) NULL,
    ApellidoMaterno NVARCHAR(60) NULL,
    Oficio          NVARCHAR(100) NULL,  -- Ej: Carpintero, Soldador
    
    -- Datos de Identificación
    INE_Clave       VARCHAR(18) NULL,    -- Clave de Elector
    CURP            VARCHAR(18) NULL,
    RFC             VARCHAR(13) NULL,
    FechaNacimiento DATE NULL,
    
    -- Datos de Contacto
    Telefono        NVARCHAR(20) NULL,
    Correo          NVARCHAR(100) NULL,
    Direccion       NVARCHAR(250) NULL,

    -- Datos Bancarios
    Banco           NVARCHAR(50) NULL,
    CuentaBancaria  VARCHAR(20) NULL,    -- CLABE o Número de cuenta
    
    -- Datos Administrativos
    EsFacturador    BIT DEFAULT 0,       -- 0 = Nómina normal, 1 = Emite Factura
    FechaIngreso    DATE DEFAULT GETDATE(),
    FechaBaja       DATE NULL;           -- Para historial cuando se den de baja
GO

-- Índice para buscar rápidamente por Clave de Empleado
CREATE INDEX IX_Trabajador_Clave ON Trabajador(ClaveEmpleado);
GO


/*===========================================================
=      2. NUEVO CATÁLOGO: CONCEPTOS DE NÓMINA              =
=  Define qué se paga (Percepciones) y qué se descuenta    =
===========================================================*/

CREATE TABLE Cat_ConceptoNomina (
    ConceptoID      INT IDENTITY(1,1) PRIMARY KEY,
    Codigo          VARCHAR(10) NOT NULL, -- Ej. P01, D01
    Nombre          NVARCHAR(100) NOT NULL,
    Tipo            CHAR(1) NOT NULL CHECK (Tipo IN ('P', 'D')), -- P = Percepción (+), D = Deducción (-)
    EsFijo          BIT DEFAULT 0 -- 1 = Se aplica siempre cada semana, 0 = Es eventual
);
GO

-- Insertamos los conceptos estándar de construcción
INSERT INTO Cat_ConceptoNomina (Codigo, Nombre, Tipo, EsFijo) VALUES 
('P01', 'Sueldo Base / Raya', 'P', 1),
('P02', 'Horas Extra', 'P', 0),
('P03', 'Destajo / Avance', 'P', 0),
('P04', 'Bono de Puntualidad', 'P', 0),
('P05', 'Séptimo Día', 'P', 1),
('D01', 'Préstamo Personal', 'D', 0),
('D02', 'Falta de Herramienta', 'D', 0),
('D03', 'Cuota IMSS', 'D', 1),
('D04', 'Infonavit', 'D', 0);
GO


/*===========================================================
=      3. ACTUALIZACIÓN DE TABLA: PAGO NOMINA (CABECERA)   =
=  Se agregan fechas de periodo y folio                    =
===========================================================*/

ALTER TABLE PagoNomina
ADD 
    FolioNomina      VARCHAR(20) NULL,      -- Para control interno (Ej. NOM-2024-45)
    FechaInicio      DATE NULL,             -- Inicio del periodo pagado
    FechaFin         DATE NULL,             -- Fin del periodo pagado
    DiasPagados      DECIMAL(4,1) DEFAULT 0,
    Observaciones    NVARCHAR(250) NULL,
    -- Auditoría
    FechaRegistro    DATETIME DEFAULT GETDATE();
GO


/*===========================================================
=      4. NUEVA TABLA: DETALLE DE NÓMINA                   =
=  Desglosa línea por línea el pago (Sueldo, Extras, etc.) =
===========================================================*/

CREATE TABLE PagoNominaDetalle (
    DetalleID       INT IDENTITY(1,1) PRIMARY KEY,
    NominaID        INT NOT NULL,
    ConceptoID      INT NOT NULL,
    Cantidad        DECIMAL(18,2) DEFAULT 1, -- Ej. 8 horas, 1 unidad
    MontoUnitario   DECIMAL(18,2) NOT NULL,  -- Cuánto vale la unidad
    ImporteTotal    AS (Cantidad * MontoUnitario) PERSISTED, -- Cálculo automático
    
    CONSTRAINT FK_Detalle_Nomina FOREIGN KEY (NominaID) REFERENCES PagoNomina(NominaID) ON DELETE CASCADE,
    CONSTRAINT FK_Detalle_Concepto FOREIGN KEY (ConceptoID) REFERENCES Cat_ConceptoNomina(ConceptoID)
);
GO


/*===========================================================
=      5. NUEVA TABLA: DOCUMENTOS DE TRABAJADOR            =
=  Para guardar rutas de archivos (INE, Contrato, etc.)    =
===========================================================*/

CREATE TABLE DocumentoTrabajador (
    DocumentoID     INT IDENTITY(1,1) PRIMARY KEY,
    TrabajadorID    INT NOT NULL,
    TipoDocumento   NVARCHAR(50) NOT NULL, -- Ej: 'INE', 'Comprobante Domicilio', 'Contrato'
    NombreArchivo   NVARCHAR(150) NOT NULL,
    RutaAlmacenamiento NVARCHAR(MAX) NULL, -- URL o Ruta en servidor local
    FechaCarga      DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Doc_Trab FOREIGN KEY (TrabajadorID) REFERENCES Trabajador(TrabajadorID) ON DELETE CASCADE
);
GO

/*===========================================================
=                Datos de las tablas                        =
===========================================================*/

INSERT INTO Cat_TipoProveedor VALUES ('Material'), ('Maquinaria'), ('Varios');

INSERT INTO Cat_TipoIngreso VALUES ('Estimación'), ('Aporte Interno'), ('Anticipo');

INSERT INTO Cat_CategoriaGasto VALUES 
('Mano de Obra'), ('Servicios'), ('Viaticos'), ('Fianzas'), ('Penalizacion');

INSERT INTO Cat_TipoRetencion VALUES 
('Falta REPSE'), ('Falta IMSS'), ('Garantía');

INSERT INTO Cat_Estatus VALUES 
('Activa'), ('Cerrada'), ('Recuperada'), ('Baja');



--Esto dejará:

--TipoIngresoID	Nombre
--1	Estimación
--2	Aporte Interno
--3	Anticipo
--🚧 2. SCRIPT COMPLETO DE DATOS (REALISTA, 2 OBRAS)

--Incluye: clientes, proveedores, 2 obras, ingresos, gastos, compras, maquinaria, nómina, avances y retenciones.

--✅ A) CLIENTES
INSERT INTO Cliente (Nombre, RFC, Telefono, Correo)
VALUES
('Constructora del Bajío S.A. de C.V.', 'CDB810923AB3', '4771234567', 'contacto@cdb.com'),
('Infraestructura MX S.A.P.I.', 'IMX920112CD7', '5556781122', 'proyectos@infra.mx');

--✅ B) PROVEEDORES
INSERT INTO Proveedor (Nombre, RFC, TipoProveedorID, Telefono, Correo)
VALUES
('CEMEX México', 'CEM900101AA1', 1, '8001234567', 'ventas@cemex.com'),
('Ternium Acero', 'TER880201BA9', 1, '8007654321', 'ventas@ternium.com'),
('Maquinaria del Centro', 'MAC940201ZA2', 2, '4425543321', 'rentas@macentro.com'),
('Servicios y Fianzas Atlas', 'SFA820501MN2', 3, '5577991122', 'contacto@atlas.com'),
('Logística Industrial', 'LIN910201CD9', 3, '5544331122', 'informes@logistica.mx');

--✅ C) OBRAS (2 PROYECTOS)
INSERT INTO Obra (ClienteID, Nombre, Ubicacion, FechaInicio, FechaFin, EstatusID, CentroCostos, MontoContrato)
VALUES
(1, 'Planta Industrial León – Nave 3', 'León, Guanajuato', '2024-01-15', '2024-11-30', 1, 'N3-450', 28500000.00),

(2, 'Edificio Administrativo CDMX – Torre Sur', 'CDMX, México', '2024-02-01', '2024-12-15', 1, 'TS-880', 41500000.00);


--ObraID asignados:
--1 = León
--2 = CDMX

--✅ D) INGRESOS REALISTAS
--🏗 Obra 1 (León)
---- Anticipo
INSERT INTO Ingreso (ObraID, Fecha, TipoIngresoID, Descripcion, Monto, FacturaRef)
VALUES (1, '2024-01-20', 3, 'Anticipo del 20%', 5700000.00, 'ANT-LN-01');

-- Estimación 1
INSERT INTO Ingreso VALUES
(1, '2024-03-01', 1, 'Estimación 01 – Cimentación', 2500000.00, 'EST-LN-01'),
(1, '2024-04-01', 1, 'Estimación 02 – Estructura', 3100000.00, 'EST-LN-02'),
(1, '2024-05-01', 2, 'Aporte interno para materiales urgentes', 500000.00, 'INT-LN-01');

--🏢 Obra 2 (CDMX)
INSERT INTO Ingreso VALUES
(2, '2024-02-10', 3, 'Anticipo del 15%', 6225000.00, 'ANT-CD-01'),
(2, '2024-03-15', 1, 'Estimación 01 – Demoliciones', 1800000.00, 'EST-CD-01'),
(2, '2024-04-20', 1, 'Estimación 02 – Estructura metálica', 4200000.00, 'EST-CD-02'),
(2, '2024-05-10', 2, 'Aporte interno para trámites', 300000.00, 'INT-CD-01');

--✅ E) COMPRAS DE MATERIALES + DETALLE
--Obra 1
INSERT INTO CompraMaterial (ObraID, ProveedorID, Fecha, FolioFactura, TotalCompra)
VALUES (1, 1, '2024-03-05', 'FAC-ML-01', 780000.00);

INSERT INTO CompraMaterialDetalle (CompraID, MaterialNombre, Cantidad, Unidad, PrecioUnitario)
VALUES
(1, 'Cemento CPC 30R', 800, 'bultos', 185.00),
(1, 'Varilla 3/8"', 2000, 'kg', 26.50);

--Obra 2
INSERT INTO CompraMaterial (ObraID, ProveedorID, Fecha, FolioFactura, TotalCompra)
VALUES (2, 2, '2024-04-01', 'FAC-CD-01', 1120000.00);

INSERT INTO CompraMaterialDetalle VALUES
(2, 'Lámina Zintro Alum', 300, 'piezas', 380.00),
(2, 'Placa de acero 1/4"', 120, 'piezas', 950.00);

--✅ F) RENTA DE MAQUINARIA
INSERT INTO RentaMaquinaria (ObraID, ProveedorID, Descripcion, FechaInicio, FechaFin, CostoTotal)
VALUES
(1, 3, 'Retroexcavadora con operador', '2024-03-10', '2024-03-20', 45000.00),
(2, 3, 'Grua 45 toneladas', '2024-03-25', '2024-04-02', 87000.00);

--✅ G) GASTOS GENERALES
INSERT INTO GastoGeneral VALUES
(1, '2024-03-15', 1, 'Pago de cuadrilla de cimentación', NULL, 180000.00, 'GG-LN-01'),
(1, '2024-04-01', 4, 'Pago de fianza de cumplimiento', 4, 32000.00, 'GG-LN-02'),

(2, '2024-03-10', 2, 'Servicios de topografía', 5, 26000.00, 'GG-CD-01'),
(2, '2024-04-05', 5, 'Penalización por retraso en documentación', NULL, 5000.00, 'GG-CD-02');

--✅ H) RETENCIONES
INSERT INTO Retencion (ObraID, TipoRetencionID, Fecha, Monto, EstatusID)
VALUES
(1, 3, '2024-03-01', 250000.00, 1),
(2, 1, '2024-04-01', 180000.00, 1);

--✅ I) TRABAJADORES
INSERT INTO Trabajador (NombreCompleto, Puesto, NSS, EstatusID)
VALUES
('Juan Ramírez Torres', 'Albañil', '12345678901', 1),
('Carlos Mendoza López', 'Soldador', '98765432122', 1),
('Luis Gómez Rivera', 'Supervisor', '11223344556', 1),
('Pedro Sánchez Aguilar', 'Operador de maquinaria', '66778899001', 1);

--✅ J) NÓMINA REALISTA
INSERT INTO PagoNomina VALUES
(1, 1, '2024-03-15', 4800.00),
(1, 2, '2024-03-15', 5200.00),
(2, 3, '2024-04-01', 8700.00),
(2, 4, '2024-04-02', 9200.00);

--✅ K) AVANCE FÍSICO
INSERT INTO ReporteAvance (ObraID, FechaReporte, PorcentajeFisico, Observaciones)
VALUES
(1, '2024-03-01', 10.00, 'Inicio de cimentación completado'),
(1, '2024-04-01', 25.00, 'Se montó estructura metálica'),
(2, '2024-03-15', 12.00, 'Demoliciones completas'),
(2, '2024-04-15', 28.00, 'Estructura del primer nivel terminada');

--✅ LISTO

--Este script está completo, equilibrado y realista para probar tu aplicación, dashboards, filtros, reportes y CRUD.
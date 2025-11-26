# NexusCode - Sistema de Gestión de Proyectos de Construcción

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025  
**Estado**: ✅ Producción

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Módulos Principales](#módulos-principales)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Guía de Uso](#guía-de-uso)
6. [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## Descripción General

NexusCode es una plataforma web integrada para la gestión completa de proyectos de construcción. Permite administrar obras, ingresos, gastos, proveedores y nómina de trabajadores desde una interfaz moderna y responsiva.

### Características Principales

- ✅ **Dashboard Ejecutivo**: Visualización de métricas y gráficos en tiempo real
- ✅ **Gestión de Ingresos**: Registro y seguimiento de ingresos con soporte para PDFs de factura
- ✅ **Gestión de Gastos**: Categorización automática de gastos (Materiales, Maquinaria, Sueldos)
- ✅ **Administración de Proveedores**: Base de datos de proveedores con información de contacto
- ✅ **Nómina de Trabajadores**: Cálculo automático de sueldos y pagos
- ✅ **Base de datos SQL Server**: Almacenamiento seguro y confiable de datos

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│              client/src/components/                          │
├─────────────────────────────────────────────────────────────┤
│  Dashboard | Ingresos | Gastos | Proveedores | Trabajadores │
└─────────────────┬───────────────────────────────────────────┘
                  │ (API REST)
┌─────────────────▼───────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
│                server/src/index.js                           │
├─────────────────────────────────────────────────────────────┤
│  Controllers | Services | Routes | Middleware               │
└─────────────────┬───────────────────────────────────────────┘
                  │ (ODBC Driver)
┌─────────────────▼───────────────────────────────────────────┐
│              BASE DE DATOS (SQL Server)                      │
│            database/schema.sql                               │
├─────────────────────────────────────────────────────────────┤
│  Tablas | Relaciones | Procedures | Views                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Módulos Principales

### 1. 📊 Dashboard

**Ubicación**: `client/src/components/Dashboard.js`

El Dashboard es el punto central de visualización de toda la información del proyecto. Proporciona una vista ejecutiva con métricas clave y gráficos comparativos.

#### Funcionalidades

- **Selector de Proyecto**: Selecciona una obra para visualizar sus estadísticas
- **Resumen Financiero**: Muestra totales de ingresos, gastos y balance
- **Gráficos de Distribución** (Parte Superior - Lado a Lado):
  - 🥧 Distribución de Ingresos por Categoría (Pie Chart)
  - 🥧 Distribución de Gastos por Categoría (Pie Chart)
- **Gráfico Comparativo** (Parte Inferior - Ancho Completo):
  - 📊 Ingresos vs Gastos (Bar Chart)
- **Últimos Movimientos**: Tabla con los últimos 10 movimientos financieros

#### Datos Mostrados

```javascript
{
  totalIngresos: número,        // Suma de todos los ingresos
  totalGastos: número,          // Suma de gastos (Materiales + Maquinaria + Sueldos)
  balance: número,              // Ingresos - Gastos
  ingresosPorCategoria: {},     // {NombreCategoria: monto}
  gastosPorCategoria: {}        // {Materiales: x, Maquinaria: y, Sueldos: z}
}
```

#### Estructura Visual

```
┌─ Dashboard ─────────────────────────────────────────┐
│                                                     │
│  [Selector de Proyecto: _______________]            │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  Resumen Financiero                        │   │
│  │  Ingresos: $XXX,XXX | Gastos: $XXX,XXX    │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────┬──────────────────┐           │
│  │ 🥧 Distribución  │ 🥧 Distribución  │           │
│  │ de Ingresos      │ de Gastos        │           │
│  │ por Categoría    │ por Categoría    │           │
│  │                  │                  │           │
│  │ [PieChart]       │ [PieChart]       │           │
│  └──────────────────┴──────────────────┘           │
│                                                     │
│  ┌──────────────────────────────────────────┐     │
│  │ 📊 Ingresos vs Gastos                    │     │
│  │ [BarChart - Ancho Completo]              │     │
│  └──────────────────────────────────────────┘     │
│                                                     │
│  ┌──────────────────────────────────────────┐     │
│  │ 📑 Últimos Movimientos                   │     │
│  │ [Tabla de Transacciones]                 │     │
│  └──────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2. 💰 Ingresos

**Ubicación**: `client/src/components/IngresosList.js`

Módulo para registrar y gestionar todos los ingresos de una obra específica.

#### Funcionalidades

- **Registro de Ingresos**: Crear nuevos registros de ingresos
  - Tipo de Ingreso (seleccionar de catálogo)
  - Fecha de registro
  - Descripción
  - Monto
  - **Archivo PDF de Factura** (nuevo)

- **Carga de Archivos**: Soporte para PDF de facturas
  - Subir archivo durante creación del ingreso
  - Visualizar PDF en modal desde la lista
  - Almacenamiento en `uploads/facturas/`

- **Visualización de Datos**:
  - 🥧 Distribución de Ingresos por Categoría (Pie Chart)
  - Tabla con todos los ingresos registrados
  - Filtrado por obra seleccionada

- **Edición y Eliminación**: Modificar o borrar registros

#### Campos de un Ingreso

```javascript
{
  IngresoID: number,           // ID único
  ObraID: number,              // Relación con la obra
  Fecha: date,                 // Fecha del ingreso
  TipoIngresoID: number,       // Tipo/categoría
  Descripcion: string,         // Descripción del ingreso
  Monto: number,               // Monto en $MXN
  FacturaRuta: string,         // Ruta del PDF (/uploads/facturas/FACTURA_xxxxx.pdf)
  FacturaFileName: string      // Nombre original del archivo
}
```

#### Proceso de Carga de PDF

1. Usuario hace click en "📁 Selecciona PDF de Factura"
2. Se abre selector de archivos (solo .pdf)
3. Archivo se sube a servidor en `server/uploads/facturas/`
4. Servidor devuelve la ruta relativa
5. Ruta se guarda en la BD en campo `FacturaRuta`
6. Cuando el usuario visualiza, puede hacer click en "📄 Ver Factura" para abrir el PDF

---

### 3. 💸 Gastos

**Ubicación**: `client/src/components/GastosList.js`

Módulo para administrar los gastos del proyecto, categorizados en 3 tipos principales.

#### Categorías de Gasto

| Categoría | Descripción | Tabla BD |
|-----------|-------------|----------|
| **Materiales** | Compra de materiales de construcción | `Material` |
| **Maquinaria** | Renta/compra de equipos y maquinaria | `Maquinaria` |
| **Sueldos** | Pagos a trabajadores y nómina | `PagoNomina` |

#### Funcionalidades

- **Registro de Gastos**: Crear nuevos registros en cada categoría
  - Materiales: Proveedor, artículo, cantidad, costo
  - Maquinaria: Tipo de máquina, costo, periodo
  - Sueldos: Trabajador, monto pagado, periodo

- **Visualización de Datos**:
  - 🥧 Distribución de Gastos por Categoría (Pie Chart)
  - Tablas separadas por categoría
  - Totales por categoría

- **Gestión**: Editar y eliminar registros

#### Estructura de Datos

```javascript
// Materiales
{
  MaterialID: number,
  ObraID: number,
  ProveedorID: number,
  Articulo: string,
  Cantidad: number,
  CostoUnitario: number,
  TotalCompra: number
}

// Maquinaria
{
  MaquinariaID: number,
  ObraID: number,
  TipoMaquinaria: string,
  CostoTotal: number
}

// Sueldos (PagoNomina)
{
  PagoNominaID: number,
  ObraID: number,
  TrabajadorID: number,
  MontoPagado: number
}
```

---

### 4. 👥 Proveedores

**Ubicación**: `client/src/components/ProveedoresList.js`

Base de datos de proveedores con información de contacto y comercial.

#### Funcionalidades

- **Registro de Proveedores**: Crear nuevos proveedores
  - Nombre de la empresa
  - Nombre de contacto
  - Email
  - Teléfono
  - RFC/RUC
  - Dirección
  - Sitio web (opcional)

- **Búsqueda y Filtrado**: Encontrar proveedores rápidamente

- **Edición y Eliminación**: Actualizar información de contacto

- **Relaciones**: Los proveedores se asocian con gastos de Materiales

#### Campos de un Proveedor

```javascript
{
  ProveedorID: number,         // ID único
  EmpresaNombre: string,       // Nombre de la empresa
  NombreContacto: string,      // Persona de contacto
  Email: string,               // Correo electrónico
  Telefono: string,            // Teléfono
  RFC: string,                 // RFC/RUC
  Direccion: string,           // Domicilio
  SitioWeb: string             // URL (opcional)
}
```

---

### 5. 👨‍💼 Trabajadores

**Ubicación**: `client/src/components/TrabajadoresList.js`

Administración de trabajadores y cálculo automático de nómina.

#### Funcionalidades

- **Registro de Trabajadores**: Crear nuevos registros
  - Nombre y apellido
  - INE/Documento de identidad
  - RFC
  - Puesto/posición
  - Sueldo diario
  - Fecha de inicio

- **Cálculo de Nómina Automático**:
  - Sueldo diario × Días trabajados
  - Deducciones (IMSS, ISR, etc.)
  - Neto a pagar

- **Visualización de Nómina**: 
  - Vista de tabla con trabajadores
  - Cálculo de sueldos por periodo
  - Histórico de pagos

- **Edición**: Actualizar datos y sueldo diario

#### Campos de un Trabajador

```javascript
{
  TrabajadorID: number,        // ID único
  Nombre: string,              // Nombre y apellido
  INE: string,                 // Documento de identidad
  RFC: string,                 // RFC
  Puesto: string,              // Posición/cargo
  SueldoDiario: number,        // Salario por día
  FechaInicio: date            // Fecha de contratación
}
```

#### Cálculo de Nómina

```
Sueldo Bruto = SueldoDiario × DíasTrabajados

Retenciones (aprox. 30%):
  - IMSS: ~7.65%
  - ISR: ~22%
  - Otros: ~0.35%

Sueldo Neto = Sueldo Bruto - Retenciones
```

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js** v14+ 
- **SQL Server** 2016+
- **npm** v6+

### Pasos de Instalación

#### 1. Clonar Repositorio

```bash
git clone https://github.com/ISAIMCH/pi-5sem-nexuscode.git
cd pi-5sem-nexuscode
```

#### 2. Configurar Base de Datos

```bash
# En SQL Server Management Studio, ejecutar:
sqlcmd -S servidor -U usuario -P contraseña -i database/schema.sql
```

#### 3. Instalar Dependencias Backend

```bash
cd server
npm install
```

**Archivo `.env` (server):**

```env
DB_SERVER=TU_SERVIDOR
DB_USER=TU_USUARIO
DB_PASSWORD=TU_CONTRASEÑA
DB_NAME=NEXUSCODE_DB
PORT=5000
```

#### 4. Instalar Dependencias Frontend

```bash
cd ../client
npm install
```

#### 5. Iniciar Servidor

```bash
# Terminal 1 - Backend
cd server
npm start
# Debe aparecer: "✅ Server running on port 5000"
```

#### 6. Iniciar Cliente

```bash
# Terminal 2 - Frontend
cd client
npm start
# Se abrirá http://localhost:3000 en el navegador
```

---

## Guía de Uso

### Flujo Típico de Trabajo

#### 1. Crear una Obra (Proyecto)

```
Menú Principal → Obras → + Nueva Obra
├─ Nombre del Proyecto
├─ Cliente
├─ Ubicación
├─ Presupuesto Inicial
└─ Fecha de Inicio
```

#### 2. Registrar Ingresos

```
Módulo Ingresos → Seleccionar Obra → + Nuevo Ingreso
├─ Tipo de Ingreso
├─ Fecha
├─ Descripción
├─ Monto
└─ PDF de Factura 📄 (opcional pero recomendado)
```

#### 3. Registrar Gastos

```
Módulo Gastos → Seleccionar Obra → Registrar Gasto
├─ Elegir Categoría (Materiales/Maquinaria/Sueldos)
├─ Llenar formulario específico
└─ Guardar
```

#### 4. Gestionar Proveedores

```
Módulo Proveedores
├─ + Nuevo Proveedor
├─ Llenar datos de contacto
└─ Usar en compras de materiales
```

#### 5. Registrar Trabajadores

```
Módulo Trabajadores → + Nuevo Trabajador
├─ Datos personales
├─ Información fiscal (INE, RFC)
├─ Puesto y sueldo diario
└─ La nómina se calcula automáticamente
```

#### 6. Visualizar Dashboard

```
Dashboard → Seleccionar Obra
├─ Ver resumen financiero
├─ Gráficos de distribución (Ingresos vs Gastos)
├─ Comparativa en barras (Ingresos vs Gastos)
└─ Últimos movimientos
```

### Casos de Uso Principales

**Caso 1: Revisar Financiero del Proyecto**
- Dashboard → Seleccionar Obra → Revisar gráficos

**Caso 2: Registrar Factura de Ingreso**
- Ingresos → + Nuevo → Rellenar datos + Subir PDF

**Caso 3: Registrar Compra de Materiales**
- Gastos → Materiales → Seleccionar proveedor → Guardar

**Caso 4: Calcular Nómina Quincenal**
- Trabajadores → Ver lista → Sistema calcula automáticamente

---

## Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| React | 18.2.0 | Framework principal |
| Recharts | 2.x | Gráficos (Pie, Bar) |
| CSS3 | - | Estilos y diseño responsivo |
| Axios | 0.x | Peticiones HTTP |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| Node.js | 14+ | Runtime |
| Express | 4.x | Servidor web |
| mssql | 9.x | Driver SQL Server |
| multer | 1.x | Carga de archivos |

### Base de Datos

| Componente | Especificación |
|-----------|----------------|
| Gestor | SQL Server 2016+ |
| Tablas | 10+ entidades principales |
| Relaciones | FK entre todas las entidades |

### Infraestructura

- **Almacenamiento de PDFs**: `server/uploads/facturas/`
- **Almacenamiento de INE**: `server/uploads/ine/`
- **Almacenamiento de XML**: `server/uploads/xml/`

---

## Estructura de Directorios

```
pi-5sem-nexuscode/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js        # 📊 Panel principal
│   │   │   ├── IngresosList.js     # 💰 Gestión de ingresos
│   │   │   ├── GastosList.js       # 💸 Gestión de gastos
│   │   │   ├── ProveedoresList.js  # 👥 Proveedores
│   │   │   ├── TrabajadoresList.js # 👨‍💼 Trabajadores
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js              # Cliente HTTP
│   │   └── styles/
│   │       └── Dashboard.css       # Estilos
│   └── package.json
│
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── index.js                # Punto de entrada
│   │   ├── controllers/            # Lógica de negocio
│   │   ├── services/               # Acceso a datos
│   │   ├── routes/                 # Rutas API
│   │   └── middleware/             # Middlewares
│   ├── uploads/
│   │   ├── facturas/               # PDFs de facturas
│   │   ├── ine/                    # Documentos INE
│   │   └── xml/                    # Archivos XML
│   └── package.json
│
├── database/                        # Scripts SQL
│   ├── schema.sql                  # Estructura de BD
│   ├── migrations/                 # Scripts de migración
│   └── test_insert_pagonomina.sql  # Tests
│
└── DOCUMENTACION_PROYECTO.md        # Este archivo
```

---

## Notas Importantes

### Seguridad

- 🔒 Las credenciales de BD se almacenan en `.env` (nunca commitear)
- 🔐 Los archivos PDF se validan antes de guardar
- 🛡️ Las rutas de la API requieren validación de entrada

### Rendimiento

- ⚡ Dashboard carga datos bajo demanda (no en tiempo real)
- 📊 Los gráficos se generan con Recharts (optimizado)
- 💾 Los PDFs se almacenan en servidor (no en BD)

### Mantenimiento

- 🔄 Realizar backups de BD regularmente
- 🗑️ Limpiar archivos PDF antiguos periódicamente
- 📈 Monitorear el crecimiento de la carpeta `uploads/`

---

## Soporte y Contacto

**Proyecto**: NexusCode v1.0  
**Desarrollador**: ISAIMCH  
**Repositorio**: https://github.com/ISAIMCH/pi-5sem-nexuscode

---

**© 2025 NexusCode. Todos los derechos reservados.**

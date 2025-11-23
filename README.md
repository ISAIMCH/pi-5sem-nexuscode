# NexusCode - Sistema de Gestión de Obras

Una aplicación web completa para la gestión de proyectos de construcción, incluyendo tracking de ingresos, gastos, proveedores, clientes y trabajadores.

## Requisitos Previos

- **SQL Server 2019 o superior**
- **Node.js 14+ y npm**
- **React 18+ (para desarrollo)**

## Estructura del Proyecto

```
├── database/           # Scripts SQL de la base de datos
│   └── schema.sql
├── server/             # Backend Node.js/Express
│   ├── src/
│   │   ├── config/     # Configuración de BD
│   │   ├── controllers/ # Controladores de rutas
│   │   ├── services/   # Servicios de negocio
│   │   ├── routes/     # Definición de rutas
│   │   └── index.js    # Punto de entrada
│   └── package.json
└── client/             # Frontend React
    ├── src/
    │   ├── components/ # Componentes React
    │   ├── services/   # Servicios API
    │   └── styles/     # Estilos CSS
    └── public/
```

## Instalación

### 1. Configurar Base de Datos SQL Server

```sql
-- Ejecutar el script schema.sql en SQL Server Management Studio
-- Asegúrate de que SQL Server esté ejecutándose
USE master;
GO
-- Ejecutar todo el contenido de database/schema.sql
```

### 2. Configurar Backend

```bash
cd server

# Copiar archivo de configuración
copy .env.example .env

# Editar .env con tus credenciales de SQL Server
# DB_SERVER=localhost (o tu servidor)
# DB_USER=sa
# DB_PASSWORD=tuContraseña
# DB_NAME=NexusCode_2

# Instalar dependencias
npm install

# Iniciar el servidor (desarrollo con nodemon)
npm run dev

# O para producción
npm start
```

El servidor se ejecutará en `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd client

# Copiar archivo de configuración
copy .env.example .env

# Si el servidor está en un puerto diferente, editar .env
# REACT_APP_API_URL=http://localhost:5000/api

# Instalar dependencias
npm install

# Iniciar desarrollo
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## API Endpoints

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Proveedores
- `GET /api/proveedores` - Obtener todos los proveedores
- `POST /api/proveedores` - Crear proveedor
- `PUT /api/proveedores/:id` - Actualizar proveedor
- `DELETE /api/proveedores/:id` - Eliminar proveedor

### Obras
- `GET /api/obras` - Obtener todas las obras
- `GET /api/obras/:id` - Obtener obra específica
- `GET /api/obras/:id/resumen` - Obtener resumen financiero
- `POST /api/obras` - Crear obra
- `PUT /api/obras/:id` - Actualizar obra
- `DELETE /api/obras/:id` - Eliminar obra

### Ingresos
- `GET /api/ingresos` - Obtener todos los ingresos
- `GET /api/ingresos/obra/:obraId` - Ingresos por obra
- `POST /api/ingresos` - Crear ingreso
- `PUT /api/ingresos/:id` - Actualizar ingreso
- `DELETE /api/ingresos/:id` - Eliminar ingreso

### Gastos
- `GET /api/gastos` - Obtener todos los gastos
- `GET /api/gastos/obra/:obraId` - Gastos por obra
- `POST /api/gastos` - Crear gasto
- `PUT /api/gastos/:id` - Actualizar gasto
- `DELETE /api/gastos/:id` - Eliminar gasto

### Catálogos
- `GET /api/catalogos` - Obtener todos los catálogos
- `GET /api/catalogos/tipos-proveedor`
- `GET /api/catalogos/tipos-ingreso`
- `GET /api/catalogos/categorias-gasto`
- `GET /api/catalogos/tipos-retencion`
- `GET /api/catalogos/estatuses`

## Modelos de Datos Principales

### Obra
```javascript
{
  ObraID: int,
  ClienteID: int,
  Nombre: string,
  Ubicacion: string,
  FechaInicio: date,
  FechaFin: date,
  EstatusID: int,
  CentroCostos: string,
  MontoContrato: decimal
}
```

### Cliente
```javascript
{
  ClienteID: int,
  Nombre: string,
  RFC: string,
  Telefono: string,
  Correo: string
}
```

### Proveedor
```javascript
{
  ProveedorID: int,
  Nombre: string,
  RFC: string,
  TipoProveedorID: int,
  Telefono: string,
  Correo: string
}
```

## Características Principales

✅ Gestión de Obras
✅ Gestión de Clientes
✅ Gestión de Proveedores
✅ Registro de Ingresos
✅ Registro de Gastos
✅ Dashboard resumen
✅ Catálogos estandarizados
✅ API RESTful completa

## Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Reportes PDF
- [ ] Gráficos y análisis
- [ ] Gestión de Trabajadores
- [ ] Gestión de Nómina
- [ ] Retenciones
- [ ] Compra de materiales detallada
- [ ] Renta de maquinaria

## Solución de Problemas

### Error: "Cannot connect to SQL Server"
- Verificar que SQL Server esté ejecutándose
- Revisar credenciales en `.env`
- Asegurar que el servidor está escuchando en el puerto correcto

### Error: "Database not found"
- Ejecutar el script `database/schema.sql` en SQL Server
- Verificar que el nombre de la base de datos es `NexusCode_2`

### Error: CORS
- Verificar que `REACT_APP_API_URL` apunta al servidor correcto
- Asegurar que CORS está habilitado en `server/src/index.js`

## Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 👥 Equipo de Desarrollo

Este proyecto ha sido diseñado, documentado y programado por:

| Integrante | Rol Principal |
| :--- | :--- |
| **Isai Montaño Chávez** | *Full Stack Developer / Arquitectura de BD* |
| **Galilea Alonzo Hernández** | *Frontend Developer / UI Design* |
| **Daniel López Gonzales** | *Backend Developer / Lógica de Negocio* |
| **Leilany Aislinn Sanchez Reyes** | *Analista de Datos / Documentación* |
| **Xavier Amed Guerrero Hernández** | *QA Testing / Gestión de Proyecto* |

---


## Licencia

Este proyecto está bajo licencia ISC.
# Backend - NexusCode Node.js/Express API

## 📋 Contenido de esta carpeta

```
server/
├── src/
│   ├── index.js           # Punto de entrada
│   │
│   ├── config/
│   │   └── database.js    # Conexión SQL Server
│   │
│   ├── controllers/       # Manejadores de rutas
│   │   ├── clienteController.js
│   │   ├── proveedorController.js
│   │   ├── obraController.js
│   │   ├── ingresoController.js
│   │   ├── gastoController.js
│   │   └── catalogoController.js
│   │
│   ├── services/          # Lógica de negocio
│   │   ├── ClienteService.js
│   │   ├── ProveedorService.js
│   │   ├── ObraService.js
│   │   ├── ingresoService.js
│   │   ├── gastoService.js
│   │   └── catalogoService.js
│   │
│   ├── routes/            # Definición de endpoints
│   │   ├── cliente.js
│   │   ├── proveedor.js
│   │   ├── obra.js
│   │   ├── ingreso.js
│   │   ├── gasto.js
│   │   ├── catalogo.js
│   │   ├── renta.js
│   │   ├── trabajador.js
│   │   └── nomina.js
│   │
│   └── middleware/        # Middlewares (futuro)
│
├── .env.example           # Template de variables
├── package.json           # Dependencias
└── README.md             # Este archivo
```

## 🚀 Iniciar en Desarrollo

```bash
# 1. Crear archivo .env
copy .env.example .env

# 2. Editar .env con credenciales
notepad .env

# 3. Instalar dependencias
npm install

# 4. Iniciar con nodemon (auto-reload)
npm run dev

# El servidor se ejecutará en http://localhost:5000
```

## 📦 Dependencias

- **express** - Framework web
- **mssql** - Driver SQL Server
- **dotenv** - Variables de entorno
- **cors** - Control de acceso cross-origin
- **nodemon** - Auto-reload en desarrollo

## 🏗️ Arquitectura MVC

```
REQUEST
   ↓
ROUTER (routes/*.js)
   ↓
CONTROLLER (controllers/*.js)
   ↓
SERVICE (services/*.js)
   ↓
DATABASE (config/database.js)
   ↓
SQL QUERY
   ↓
RESPONSE
```

## 📝 Patrón de Código

### Ruta
```javascript
// routes/cliente.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.getAllClientes);
module.exports = router;
```

### Controlador
```javascript
// controllers/clienteController.js
const clienteService = require('../services/clienteService');

exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await clienteService.getAllClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Servicio
```javascript
// services/ClienteService.js
const { sql, poolPromise } = require('../config/database');

class ClienteService {
  async getAllClientes() {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Cliente');
    return result.recordset;
  }
}
```

## 🔌 API Endpoints

### Clientes
- `GET /api/clientes` - Obtener todos
- `GET /api/clientes/:id` - Obtener por ID
- `POST /api/clientes` - Crear
- `PUT /api/clientes/:id` - Actualizar
- `DELETE /api/clientes/:id` - Eliminar

### Proveedores
- `GET /api/proveedores`
- `GET /api/proveedores/:id`
- `POST /api/proveedores`
- `PUT /api/proveedores/:id`
- `DELETE /api/proveedores/:id`

### Obras
- `GET /api/obras`
- `GET /api/obras/:id`
- `GET /api/obras/:id/resumen` - Resumen financiero
- `POST /api/obras`
- `PUT /api/obras/:id`
- `DELETE /api/obras/:id`

### Otros
- Ingresos: `/api/ingresos`
- Gastos: `/api/gastos`
- Catálogos: `/api/catalogos`

## ⚙️ Configuración

### Variables de Entorno (.env)

```
DB_SERVER=localhost        # Servidor SQL
DB_USER=sa                 # Usuario SQL
DB_PASSWORD=Password123    # Contraseña
DB_NAME=NexusCode_2        # Base de datos
PORT=5000                  # Puerto servidor
NODE_ENV=development       # Ambiente
```

## 🔐 Seguridad

### Implementado
- CORS configurado
- Manejo de errores
- Variables de entorno

### Recomendado para Producción
- JWT Authentication
- Rate Limiting
- Input Validation
- HTTPS/TLS
- SQL Injection Prevention

## 🧪 Probar Endpoints

### Con cURL
```bash
curl -X GET http://localhost:5000/api/clientes
```

### Con PowerShell
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/clientes"
```

### Con Postman
1. Abre Postman
2. New Request
3. Selecciona método HTTP
4. Ingresa URL
5. Click Send

## 📊 Estructura de Datos

### Cliente
```json
{
  "ClienteID": 1,
  "Nombre": "Acme Corp",
  "RFC": "ACM123456",
  "Telefono": "5551234567",
  "Correo": "info@acme.com"
}
```

### Obra
```json
{
  "ObraID": 1,
  "ClienteID": 1,
  "Nombre": "Centro Comercial",
  "MontoContrato": 500000.00,
  "EstatusID": 1
}
```

## 🐛 Troubleshooting

### Error: "Cannot connect to SQL Server"
```
1. Verificar SQL Server está ejecutándose
2. Verificar credenciales en .env
3. Verificar puerto 1433 disponible
```

### Error: "Port 5000 already in use"
```
1. Cambiar PORT en .env a 5001
2. O matar proceso: netstat -ano | findstr :5000
```

### Error: "module not found"
```bash
npm install
```

## 📚 Recursos

- [Express Docs](https://expressjs.com)
- [mssql Package](https://github.com/tediousjs/node-mssql)
- [SQL Server Docs](https://docs.microsoft.com/en-us/sql/)

## 🔄 Ciclo de Vida

```
1. npm run dev
2. Servidor escucha en puerto 5000
3. Intenta conectar a SQL Server
4. Si conecta: "Connected to SQL Server"
5. Espera requests HTTP
6. Procesa y retorna respuesta
```

## 📈 Desarrollo

### Agregar nuevo endpoint

1. Crear ruta en `routes/nueva.js`
2. Crear controlador en `controllers/nuevaController.js`
3. Crear servicio en `services/NuevaService.js`
4. Importar ruta en `index.js`

### Ejemplo

```javascript
// routes/ejemplo.js
const router = require('express').Router();
const ejemploController = require('../controllers/ejemploController');

router.get('/', ejemploController.getAll);
module.exports = router;

// En index.js
app.use('/api/ejemplo', require('./routes/ejemplo'));
```

## 🎯 Próximas Mejoras

- [ ] JWT Authentication
- [ ] Rate Limiting
- [ ] Request Validation
- [ ] Error Logging
- [ ] Database Migrations
- [ ] Unit Tests
- [ ] API Documentation (Swagger)

---

**Última actualización:** 21 de Noviembre de 2025

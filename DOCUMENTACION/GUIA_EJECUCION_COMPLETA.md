# 🚀 GUÍA COMPLETA DE EJECUCIÓN - NexusCode

**Instrucciones paso a paso para ejecutar el proyecto completamente**

---

## 📋 REQUISITOS PREVIOS

### Software Requerido

```
✅ SQL Server 2019 o superior
✅ Node.js 14+ (recomendado 16+)
✅ npm 6+ (incluido con Node.js)
✅ Git (opcional pero recomendado)
✅ Un editor de código (VS Code recomendado)
```

### Verificar Instalaciones

```powershell
# En PowerShell

# Verificar SQL Server (debe mostrar versión)
sqlcmd -S localhost -U sa -P YourPassword -Q "SELECT @@VERSION"

# Verificar Node.js
node --version        # Debe mostrar v14.0.0 o superior

# Verificar npm
npm --version         # Debe mostrar 6.0.0 o superior
```

---

## 🗄️ PASO 1: CONFIGURAR BASE DE DATOS

### Opción A: Usando SQL Server Management Studio (SSMS)

```
1. Abrir SQL Server Management Studio

2. Conectarse a tu servidor:
   - Server name: localhost (o tu servidor)
   - Authentication: SQL Server Authentication
   - Login: sa
   - Password: (tu contraseña)

3. File → Open → File
   Seleccionar: database/schema.sql

4. Ejecutar Script:
   - Presionar F5 o botón "Execute"
   - Esperar a que complete

5. Verificar:
   - En Object Explorer, expandir "Databases"
   - Debe aparecer "NexusCode_2"
   - Expandirla para ver tablas (17 tablas)
```

### Opción B: Usando Línea de Comandos

```powershell
# Navegar a la carpeta del proyecto
cd C:\ruta\a\AAAAAA

# Ejecutar script SQL
sqlcmd -S localhost -U sa -P YourPassword -i database/schema.sql

# Verificar
sqlcmd -S localhost -U sa -P YourPassword -Q "SELECT COUNT(*) as Tablas FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG='NexusCode_2'"
```

### Verificar Conexión

```sql
-- Ejecutar en SSMS
USE NexusCode_2
GO

-- Ver todas las tablas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME
GO

-- Verificar datos iniciales
SELECT * FROM Cat_TipoProveedor
GO
```

**Resultado esperado:**
```
Material
Maquinaria
Varios
```

---

## ⚙️ PASO 2: CONFIGURAR BACKEND

### 2.1 Instalar Dependencias

```powershell
# Navegar a carpeta server
cd server

# Instalar dependencias
npm install

# Debe instalar:
# - express (servidor web)
# - mssql (driver SQL Server)
# - dotenv (variables de entorno)
# - cors (control de origen)
# - nodemon (desarrollo automático)
```

### 2.2 Configurar Variables de Entorno

```powershell
# En carpeta server, crear archivo .env

# Para Windows, usando Notepad++:
# File → New → Guardar como ".env"

# Contenido del archivo .env:
```

```env
# Base de Datos
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_NAME=NexusCode_2

# Servidor
PORT=5000
NODE_ENV=development
```

### 2.3 Iniciar Backend

```powershell
# Asegurarse de estar en carpeta /server

# Opción A: Desarrollo (con auto-reload)
npm run dev

# Opción B: Producción
npm start

# Resultado esperado:
# Server running on port 5000
```

### 2.4 Verificar Backend Funcionando

```powershell
# En otra terminal PowerShell

# Prueba 1: Verificar servidor responde
Invoke-WebRequest http://localhost:5000/api/clientes

# Resultado esperado: Array vacío [] o con datos

# Prueba 2: Obtener proveedores
Invoke-WebRequest http://localhost:5000/api/proveedores

# Prueba 3: Obtener catalogos
Invoke-WebRequest http://localhost:5000/api/catalogos
```

---

## ⚛️ PASO 3: CONFIGURAR FRONTEND

### 3.1 Instalar Dependencias

```powershell
# En otra terminal (NO cerrar la del backend)

# Navegar a carpeta client
cd client

# Instalar dependencias
npm install

# Debe instalar:
# - react
# - react-dom
# - react-scripts
# - recharts (gráficos)
```

### 3.2 Configurar Variables de Entorno (Opcional)

```powershell
# En carpeta client, crear .env (normalmente no es necesario)

# Contenido:
REACT_APP_API_URL=http://localhost:5000/api
```

### 3.3 Iniciar Frontend

```powershell
# En carpeta client

npm start

# La aplicación se abrirá automáticamente en http://localhost:3000
# Si no se abre, ir manualmente a ese URL

# Resultado esperado:
# ✔ Compiled successfully!
# ℹ Webpack compiled with warnings
```

---

## 🌐 VERIFICAR QUE TODO FUNCIONA

### Checklist de Verificación

```
✅ Base de datos
   [ ] SQL Server ejecutándose
   [ ] Base de datos NexusCode_2 creada
   [ ] 17 tablas visibles en SSMS
   
✅ Backend
   [ ] Terminal muestra "Server running on port 5000"
   [ ] http://localhost:5000/api/clientes retorna []
   [ ] Sin errores en la terminal
   
✅ Frontend
   [ ] http://localhost:3000 se abre automáticamente
   [ ] Logo "NexusCode" visible
   [ ] Sidebar con menú visible
   [ ] Dashboard se carga sin errores
```

---

## 🧪 GUÍA DE PRUEBAS FUNCIONALES

### Prueba 1: Crear un Cliente

```
1. Frontend - Ir a sección "Clientes"
2. Botón "Agregar Cliente" o formulario
3. Llenar campos:
   - Nombre: "Mi Empresa"
   - RFC: "MEM123456"
   - Teléfono: "1234567890"
   - Correo: "empresa@ejemplo.com"
4. Guardar
5. Debe aparecer en el listado
```

**Backend (verificación):**
```powershell
# Ver el cliente creado
Invoke-WebRequest http://localhost:5000/api/clientes | 
  ConvertFrom-Json | Format-Table -AutoSize
```

**BD (verificación):**
```sql
SELECT * FROM Cliente
```

### Prueba 2: Crear una Obra

```
1. Frontend - Ir a "Obras"
2. Botón "Agregar Obra"
3. Llenar campos:
   - Cliente: (seleccionar el que creamos)
   - Nombre: "Construcción Casa"
   - Ubicación: "Calle 123"
   - Monto Contrato: 100000
4. Guardar
5. Debe aparecer en el listado
```

**Verificación BD:**
```sql
USE NexusCode_2
GO
SELECT o.*, c.Nombre as NombreCliente 
FROM Obra o
JOIN Cliente c ON o.ClienteID = c.ClienteID
```

### Prueba 3: Crear Ingreso

```
1. Frontend - Ir a "Ingresos"
2. Seleccionar una obra
3. Agregar ingreso:
   - Tipo: "Anticipo"
   - Monto: 50000
   - Fecha: (hoy)
4. Guardar
```

**Verificación API:**
```powershell
$obraId = 1  # O el ID correcto
Invoke-WebRequest "http://localhost:5000/api/ingresos/obra/$obraId" |
  ConvertFrom-Json | Format-Table -AutoSize
```

### Prueba 4: Ver Dashboard

```
1. Frontend - Ir a "Dashboard"
2. Debe mostrar:
   - Total de obras
   - Total de clientes
   - Total de proveedores
   - Ingresos totales
   - Gastos totales
   - Balance
   - Gráficos interactivos
3. Seleccionar una obra para ver detalles
```

### Prueba 5: Crear Proveedor

```
1. Frontend - Ir a "Proveedores"
2. Agregar proveedor:
   - Nombre: "Ferretería XYZ"
   - RFC: "FXY123456"
   - Tipo: "Material"
   - Teléfono: "9876543210"
3. Guardar
4. Debe aparecer en listado
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Problema: "Server running on port 5000" pero no puedo acceder

**Solución:**
```powershell
# Verificar puerto abierto
netstat -ano | findstr :5000

# Si está en uso, cambiar puerto en .env
PORT=5001

# Reiniciar backend
```

### Problema: "Cannot connect to database"

**Causas posibles:**

1. SQL Server no está ejecutándose
```powershell
# Verificar servicio
Get-Service -Name "MSSQLSERVER"

# Si está detenido, iniciar
Start-Service -Name "MSSQLSERVER"
```

2. Credenciales incorrectas en .env
```env
# Verificar que coincidan
DB_USER=sa
DB_PASSWORD=YourPassword123  # Debe ser tu contraseña real
```

3. Nombre de servidor incorrecto
```env
DB_SERVER=localhost
# O si está remoto:
DB_SERVER=192.168.1.100
# O nombre servidor:
DB_SERVER=SERVIDOR\SQLEXPRESS
```

### Problema: Frontend no se conecta a backend

**Verificar:**
```powershell
# Desde PowerShell
curl http://localhost:5000/api/clientes

# Debe retornar JSON, no error
```

**Si devuelve error CORS:**
```javascript
// En server/src/index.js, verificar:
app.use(cors());

// Debe estar antes de las rutas
```

### Problema: "Module not found" error en frontend

**Solución:**
```powershell
# Limpiar instalación
cd client
rm -r node_modules
npm install

# Reiniciar
npm start
```

### Problema: Puerto 3000 ya está en uso

```powershell
# Encontrar proceso usando puerto 3000
netstat -ano | findstr :3000

# Matar proceso (CUIDADOSAMENTE)
Stop-Process -Id <PID> -Force

# O cambiar puerto en React
set PORT=3001 && npm start
```

---

## 📊 COMANDOS ÚTILES

### Backend

```powershell
# Terminal 1: Desarrollo
cd server
npm run dev

# Terminal 1: Producción
cd server
npm start

# Parar servidor
Ctrl + C

# Reinstalar dependencias
cd server
rm -r node_modules package-lock.json
npm install
```

### Frontend

```powershell
# Terminal 2: Desarrollo
cd client
npm start

# Build para producción
cd client
npm run build

# Parar servidor
Ctrl + C

# Reinstalar dependencias
cd client
rm -r node_modules package-lock.json
npm install
```

### Base de Datos

```powershell
# Conectar con SQL Server
sqlcmd -S localhost -U sa -P YourPassword

# En Query (una línea)
sqlcmd -S localhost -U sa -P YourPassword -Q "SELECT COUNT(*) FROM NexusCode_2.dbo.Cliente"

# Ver todas las bases de datos
sqlcmd -S localhost -U sa -P YourPassword -Q "SELECT name FROM sys.databases"
```

---

## 📈 ESTRUCTURA DE CARPETAS EN DESARROLLO

```
AAAAAA/
├── database/
│   └── schema.sql
│
├── server/
│   ├── node_modules/          ← Auto-generado (npm install)
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/       ← 12 controladores
│   │   ├── services/          ← 6 servicios
│   │   ├── routes/            ← 9+ rutas
│   │   ├── middleware/
│   │   └── index.js
│   ├── .env                   ← Crear manualmente
│   ├── .env.example           ← Referencia
│   ├── package.json
│   └── package-lock.json      ← Auto-generado
│
├── client/
│   ├── node_modules/          ← Auto-generado
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/        ← 7 componentes
│   │   ├── services/api.js
│   │   ├── styles/            ← 8 CSS files
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env                   ← Crear manualmente (opcional)
│   ├── .env.example           ← Referencia
│   ├── package.json
│   └── package-lock.json      ← Auto-generado
│
└── [Documentación]
```

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE VERIFICACIÓN

1. **Explorar Dashboard**
   - Crear varios clientes y obras
   - Añadir ingresos y gastos
   - Ver cómo se actualizan gráficos

2. **Probar CRUD Completo**
   - Crear, leer, actualizar, eliminar en cada módulo
   - Verificar que la BD se actualiza

3. **Revisar Código**
   - Examinar cómo funcionan los componentes
   - Entender flujo de datos
   - Consultar documentación

4. **Implementar Mejoras**
   - Ver ANALISIS_TECNICO_PROFUNDO.md
   - Implementar sugerencias
   - Añadir seguridad

---

## 🚨 EN CASO DE EMERGENCIA

### Resetear Todo

```powershell
# 1. Parar servidores (Ctrl+C en ambas terminales)

# 2. Borrar base de datos
sqlcmd -S localhost -U sa -P YourPassword -Q "DROP DATABASE NexusCode_2"

# 3. Recrearla
sqlcmd -S localhost -U sa -P YourPassword -i database/schema.sql

# 4. Limpiar node_modules (si hay conflictos)
cd server
rm -r node_modules package-lock.json
npm install

cd ..\client
rm -r node_modules package-lock.json
npm install

# 5. Reiniciar desde cero
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm start
```

### Reinstalar Completamente

```powershell
# ¡CUIDADO! Esto borra TODO

# 1. Borrar carpetas node_modules
rm -r server/node_modules
rm -r client/node_modules

# 2. Borrar package-lock.json
rm server/package-lock.json
rm client/package-lock.json

# 3. Borrar .env
rm server/.env
rm client/.env

# 4. Empezar de nuevo desde PASO 1
```

---

## ✅ VERIFICACIÓN FINAL

Si completaste todos los pasos, deberías ver:

```
TERMINAL 1 (Backend):
✓ Server running on port 5000
✓ Connected to SQL Server
✓ Sin errores rojo

TERMINAL 2 (Frontend):
✓ Compiled successfully!
✓ Webpack compiled
✓ http://localhost:3000 abierto

NAVEGADOR:
✓ Logo "NexusCode" visible
✓ Sidebar con menú lateral
✓ Dashboard cargando datos
✓ Sin errores en consola (F12)

BASE DE DATOS:
✓ 17 tablas en NexusCode_2
✓ Catálogos con datos iniciales
✓ Puedo insertar datos desde BD

TODO JUNTO:
✓ Crear cliente en frontend
✓ Aparece en listado
✓ Se ve en BD
✓ Sin errores en consola del servidor
```

---

**¡FELICIDADES! Tu aplicación NexusCode está completamente funcional.**

---

**Guía de Ejecución Completada**  
**GitHub Copilot - Claude Haiku 4.5**  
**22 de Noviembre de 2025**

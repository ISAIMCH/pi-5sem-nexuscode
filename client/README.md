# Frontend - NexusCode React App

## 📋 Contenido de esta carpeta

```
client/
├── public/              # Archivos estáticos HTML
│   └── index.html      # Punto de entrada HTML
│
├── src/
│   ├── App.js          # Componente principal
│   ├── App.css         # Estilos de App
│   ├── index.js        # ReactDOM.render
│   ├── index.css       # Estilos globales
│   │
│   ├── components/     # Componentes React
│   │   ├── Dashboard.js
│   │   ├── ObrasList.js
│   │   ├── ClientesList.js
│   │   └── ProveedoresList.js
│   │
│   ├── services/       # Servicios
│   │   └── api.js      # Cliente HTTP
│   │
│   └── styles/         # Estilos CSS
│       ├── Dashboard.css
│       ├── ObrasList.css
│       ├── ClientesList.css
│       └── ProveedoresList.css
│
├── .env.example        # Template de variables de entorno
├── package.json        # Dependencias
└── README.md          # Este archivo

```

## 🚀 Iniciar en Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start

# La aplicación se abrirá en http://localhost:3000
```

## 📦 Dependencias Principales

- **react** - Librería de UI
- **react-dom** - Integración con DOM

## 🎨 Estructura de Componentes

### App.js (Componente Raíz)
- Maneja navegación
- Renderiza componentes según página actual
- Navbar y Footer

### Dashboard
- Vista principal
- Métricas resumen
- Cards informativos

### ObrasList
- Tabla de obras
- Carga desde API
- Botones de acción

### ClientesList
- Tabla de clientes
- Formulario para crear
- Integración con API

### ProveedoresList
- Tabla de proveedores
- Formulario con select
- Carga de catálogos

## 🔗 Conexión con Backend

El archivo `services/api.js` contiene todos los métodos HTTP:

```javascript
// Ejemplo
import { clientesAPI } from './services/api';

// Uso en componente
const clientes = await clientesAPI.getAll();
```

## 🎯 Variables de Entorno

Crear archivo `.env` con:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📱 Diseño

- Responsive design con CSS Grid/Flexbox
- Navegación en navbar
- Colores: #2c3e50 (principal), #3498db (acento)

## 🧪 Estructura de un Componente

```javascript
import React, { useState, useEffect } from 'react';
import { componentAPI } from '../services/api';
import '../styles/Component.css';

const ComponentName = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await componentAPI.getAll();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Contenido */}
    </div>
  );
};

export default ComponentName;
```

## 🔄 Flujo de Datos

```
Usuario interactúa
        ↓
Componente React
        ↓
api.js (fetch HTTP)
        ↓
Backend (localhost:5000)
        ↓
SQL Server
        ↓
Response JSON
        ↓
setState en React
        ↓
Render actualizado
```

## 📝 Notas de Desarrollo

- Usar `npm start` para desarrollo
- `npm run build` para producción
- Los cambios se reflejan automáticamente (hot reload)
- Revisar consola (F12) para errores

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: CORS
```
Verificar que backend esté corriendo en puerto 5000
Verificar REACT_APP_API_URL en .env
```

### Error: "Port 3000 already in use"
```bash
npm start -- --port 3001
```

## 📚 Recursos

- [React Docs](https://react.dev)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

---

**Última actualización:** 21 de Noviembre de 2025

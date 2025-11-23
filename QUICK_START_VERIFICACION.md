# ⚡ QUICK START - Verificar Reparación

## 1️⃣ Diagnóstico Rápido (2 minutos)

```bash
# Navega a la carpeta del servidor
cd server

# Ejecuta el script de diagnóstico
node diagnostico.js
```

**Resultado esperado**:
```
✅ DIAGNÓSTICO COMPLETADO EXITOSAMENTE
```

---

## 2️⃣ Inicia la Aplicación (2 minutos)

### Terminal 1: Servidor
```bash
cd server
npm start
```

Deberías ver:
```
✓ Server running on port 5000
✓ Database connection pool initialized
```

### Terminal 2: Cliente
```bash
cd client
npm start
```

Abre el navegador automáticamente en http://localhost:3000

---

## 3️⃣ Prueba Crear un Ingreso (1 minuto)

1. Haz clic en **"Ingresos"** en el menú
2. Haz clic en **"➕ Nuevo Ingreso"**
3. Completa el formulario:
   - **Tipo**: Selecciona cualquiera
   - **Fecha**: Hoy
   - **Descripción**: "Test"
   - **Monto**: "1000"
4. Haz clic en **"💾 Guardar Ingreso"**

**Resultado esperado**: ✅ **"Ingreso guardado exitosamente"**

El ingreso aparece en la tabla → **¡FUNCIONA!**

---

## 4️⃣ Prueba Crear un Proveedor (1 minuto)

1. Haz clic en **"Proveedores"** en el menú
2. Haz clic en **"➕ Nuevo Proveedor"**
3. Completa:
   - **Nombre**: "Proveedor Test"
   - **Tipo**: Selecciona cualquiera
4. Haz clic en **"💾 Guardar Proveedor"**

**Resultado esperado**: ✅ **"Proveedor guardado exitosamente"**

El proveedor aparece en la tabla → **¡FUNCIONA!**

---

## ✅ Checklist Final (30 segundos)

- [ ] `node diagnostico.js` → ÉXITO
- [ ] Servidor muestra: "✓ Database connection pool initialized"
- [ ] Puedo crear un ingreso
- [ ] El ingreso aparece en la tabla
- [ ] Puedo crear un proveedor
- [ ] El proveedor aparece en la tabla

**Si todo está ✅, ¡la reparación fue exitosa!**

---

## 🆘 Si Algo Falla

### Problema: "Connect ECONNREFUSED"
- **Verificar**: ¿SQL Server está corriendo?
- **Solución**: Reinicia SQL Server, luego `npm start`

### Problema: "Ingreso guardado" pero no aparece en la tabla
- **Verificar**: Abre DevTools (F12) → Network tab
- **Buscar**: Request a POST `/api/ingresos`
- **Ver**: ¿Status 201 (éxito) o 500 (error)?

### Problema: Mensaje de error en lugar de éxito
- **Verificar**: El mensaje tiene detalles
- **Leer**: Puede indicar qué campo falta o es inválido

---

## 📚 Para Más Detalles

- **Guía completa**: Consulta `VERIFICACION_REPARACION.md`
- **Documentación técnica**: Consulta `DIAGNOSTICO_REPARACION.md`
- **Resumen ejecutivo**: Consulta `RESUMEN_REPARACION.md`

---

**⏱️ Tiempo total**: ~5-10 minutos

**Dificultad**: ⭐ Muy fácil

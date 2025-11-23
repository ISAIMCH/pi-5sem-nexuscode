require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const clienteRoutes = require('./routes/cliente');
const proveedorRoutes = require('./routes/proveedor');
const obraRoutes = require('./routes/obra');
const ingresoRoutes = require('./routes/ingreso');
const gastoRoutes = require('./routes/gasto');
const rentaRoutes = require('./routes/renta');
const trabajadorRoutes = require('./routes/trabajador');
const nominaRoutes = require('./routes/nomina');
const catalogoRoutes = require('./routes/catalogo');
const materialesRoutes = require('./routes/materiales');
const maquinariaRoutes = require('./routes/maquinaria');
const nominaNuevaRoutes = require('./routes/nomina-nueva');
const gastosGeneralesRoutes = require('./routes/gastos-generales');
const retencionesRoutes = require('./routes/retenciones');
const reportesRoutes = require('./routes/reportes');

// Use routes
app.use('/api/clientes', clienteRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/obras', obraRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/rentas', rentaRoutes);
app.use('/api/trabajadores', trabajadorRoutes);
app.use('/api/nominas', nominaRoutes);
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/materiales', materialesRoutes);
app.use('/api/maquinaria', maquinariaRoutes);
app.use('/api/nomina', nominaNuevaRoutes);
app.use('/api/gastos-generales', gastosGeneralesRoutes);
app.use('/api/retenciones', retencionesRoutes);
app.use('/api/reportes', reportesRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

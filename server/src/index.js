require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { poolPromise } = require('./config/database');

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
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;

// Start server only after database connection is established
poolPromise
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Database connection pool initialized`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to database connection error:', err);
    process.exit(1);
  });

module.exports = app;

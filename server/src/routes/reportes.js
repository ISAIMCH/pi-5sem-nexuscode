const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// GET: Obtener todos los reportes
router.get('/', reporteController.getAll);

// GET: Obtener todos los reportes de una obra
router.get('/obra/:obraId', reporteController.getByObra);

// GET: Obtener reporte por ID
router.get('/:id', reporteController.getById);

// POST: Crear nuevo reporte
router.post('/', reporteController.create);

// PUT: Actualizar reporte
router.put('/:id', reporteController.update);

// DELETE: Eliminar reporte
router.delete('/:id', reporteController.deleteReport);

module.exports = router;

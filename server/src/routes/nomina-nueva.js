const express = require('express');
const router = express.Router();
const NominaController = require('../controllers/NominaNewController');

// Obtener pagos de nómina de una obra
router.get('/obra/:obraID', NominaController.getByObra);

// Obtener trabajadores asignados a una obra
router.get('/trabajadores/:obraID', NominaController.getTrabajadoresByObra);

// Crear un pago de nómina individual
router.post('/', NominaController.create);

// Crear lote de nómina semanal
router.post('/lote', NominaController.createLote);

// Actualizar un pago
router.put('/:id', NominaController.update);

// Eliminar un pago
router.delete('/:id', NominaController.delete);

module.exports = router;

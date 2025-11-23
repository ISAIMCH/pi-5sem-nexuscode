const express = require('express');
const router = express.Router();
const ingresoController = require('../controllers/ingresoController');

router.get('/', ingresoController.getAllIngresos);
router.get('/obra/:obraId', ingresoController.getIngresosByObra);
router.post('/', ingresoController.createIngreso);
router.put('/:id', ingresoController.updateIngreso);
router.delete('/:id', ingresoController.deleteIngreso);

module.exports = router;

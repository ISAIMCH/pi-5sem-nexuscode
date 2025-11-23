const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');

router.get('/', gastoController.getAllGastos);
router.get('/obra/:obraId', gastoController.getGastosByObra);
router.post('/', gastoController.createGasto);
router.put('/:id', gastoController.updateGasto);
router.delete('/:id', gastoController.deleteGasto);

module.exports = router;

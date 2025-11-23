const express = require('express');
const router = express.Router();
const gastosGeneralesController = require('../controllers/GastosGeneralesController');

router.post('/', gastosGeneralesController.createGastoGeneral);
router.get('/', gastosGeneralesController.getAllGastosGenerales);
router.get('/obra/:obraId', gastosGeneralesController.getGastosGeneralesByObra);
router.put('/:id', gastosGeneralesController.updateGastoGeneral);
router.delete('/:id', gastosGeneralesController.deleteGastoGeneral);

module.exports = router;

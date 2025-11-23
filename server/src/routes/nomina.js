const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/NominaController');

router.post('/', nominaController.createNomina);
router.get('/', nominaController.getAllNomina);
router.get('/obra/:obraId', nominaController.getNominaByObra);
router.put('/:id', nominaController.updateNomina);
router.delete('/:id', nominaController.deleteNomina);

module.exports = router;

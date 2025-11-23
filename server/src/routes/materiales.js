const express = require('express');
const router = express.Router();
const materialesController = require('../controllers/MaterialesController');

router.post('/', materialesController.createMaterial);
router.get('/', materialesController.getAllMateriales);
router.get('/obra/:obraId', materialesController.getMaterialesByObra);
router.put('/:id', materialesController.updateMaterial);
router.delete('/:id', materialesController.deleteMaterial);

module.exports = router;

const express = require('express');
const router = express.Router();
const maquinariaController = require('../controllers/MaquinariaController');

router.post('/', maquinariaController.createMaquinaria);
router.get('/', maquinariaController.getAllMaquinaria);
router.get('/obra/:obraId', maquinariaController.getMaquinariaByObra);
router.put('/:id', maquinariaController.updateMaquinaria);
router.delete('/:id', maquinariaController.deleteMaquinaria);

module.exports = router;

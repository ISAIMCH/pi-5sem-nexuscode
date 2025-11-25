const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const maquinariaController = require('../controllers/MaquinariaController');

router.post('/', upload.single('FacturaArchivo'), maquinariaController.createMaquinaria);
router.get('/', maquinariaController.getAllMaquinaria);
router.get('/obra/:obraId', maquinariaController.getMaquinariaByObra);
router.put('/:id', maquinariaController.updateMaquinaria);
router.delete('/:id', maquinariaController.deleteMaquinaria);

module.exports = router;

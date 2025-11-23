const express = require('express');
const router = express.Router();
const retencionesController = require('../controllers/RetencionesController');

router.post('/', retencionesController.createRetencion);
router.get('/', retencionesController.getAllRetenciones);
router.get('/obra/:obraId', retencionesController.getRetencionesByObra);
router.put('/:id', retencionesController.updateRetencion);
router.delete('/:id', retencionesController.deleteRetencion);

module.exports = router;

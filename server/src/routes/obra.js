const express = require('express');
const router = express.Router();
const obraController = require('../controllers/obraController');

router.get('/', obraController.getAllObras);
router.get('/:id', obraController.getObraById);
router.get('/:id/resumen', obraController.getObraResumen);
router.post('/', obraController.createObra);
router.put('/:id', obraController.updateObra);
router.delete('/:id', obraController.deleteObra);

module.exports = router;

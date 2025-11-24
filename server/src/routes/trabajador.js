const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/TrabajadorController');

router.get('/', trabajadorController.getAllTrabajadores);
router.get('/obra/:obraId', trabajadorController.getTrabajadoresByObra);
router.get('/:id', trabajadorController.getTrabajadorById);
router.post('/', trabajadorController.createTrabajador);
router.post('/:id/asignar-obra', trabajadorController.assignTrabajadorToObra);
router.post('/:id/remover-obra', trabajadorController.removeTrabajadorFromObra);
router.put('/:id', trabajadorController.updateTrabajador);
router.delete('/:id', trabajadorController.deleteTrabajador);

module.exports = router;

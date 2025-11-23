const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');

router.get('/', catalogoController.getAllCatalogos);
router.get('/tipos-proveedor', catalogoController.getTiposProveedor);
router.get('/tipos-ingreso', catalogoController.getTiposIngreso);
router.get('/categorias-gasto', catalogoController.getCategoriasGasto);
router.get('/tipos-retencion', catalogoController.getTiposRetencion);
router.get('/estatuses', catalogoController.getEstatuses);

module.exports = router;

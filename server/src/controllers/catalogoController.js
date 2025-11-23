const catalogoService = require('../services/catalogoService');

exports.getTiposProveedor = async (req, res) => {
  try {
    const tipos = await catalogoService.getTiposProveedor();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTiposIngreso = async (req, res) => {
  try {
    const tipos = await catalogoService.getTiposIngreso();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoriasGasto = async (req, res) => {
  try {
    const categorias = await catalogoService.getCategoriasGasto();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTiposRetencion = async (req, res) => {
  try {
    const tipos = await catalogoService.getTiposRetencion();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEstatuses = async (req, res) => {
  try {
    const estatuses = await catalogoService.getEstatuses();
    res.json(estatuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCatalogos = async (req, res) => {
  try {
    const catalogos = await catalogoService.getAllCatalogos();
    res.json(catalogos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

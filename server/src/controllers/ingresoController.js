const ingresoService = require('../services/ingresoService');

exports.getAllIngresos = async (req, res) => {
  try {
    const ingresos = await ingresoService.getAllIngresos();
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIngresosByObra = async (req, res) => {
  try {
    const ingresos = await ingresoService.getIngresosByObra(req.params.obraId);
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createIngreso = async (req, res) => {
  try {
    const result = await ingresoService.createIngreso(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ ingresoController.createIngreso - Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateIngreso = async (req, res) => {
  try {
    const result = await ingresoService.updateIngreso(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteIngreso = async (req, res) => {
  try {
    const result = await ingresoService.deleteIngreso(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

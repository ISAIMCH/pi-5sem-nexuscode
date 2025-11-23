const gastoService = require('../services/gastoService');

exports.getAllGastos = async (req, res) => {
  try {
    const gastos = await gastoService.getAllGastos();
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGastosByObra = async (req, res) => {
  try {
    const gastos = await gastoService.getGastosByObra(req.params.obraId);
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGasto = async (req, res) => {
  try {
    const result = await gastoService.createGasto(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGasto = async (req, res) => {
  try {
    const result = await gastoService.updateGasto(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGasto = async (req, res) => {
  try {
    const result = await gastoService.deleteGasto(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

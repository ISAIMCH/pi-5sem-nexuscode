const trabajadorService = require('../services/TrabajadorService');

exports.getAllTrabajadores = async (req, res) => {
  try {
    const trabajadores = await trabajadorService.getAllTrabajadores();
    res.json(trabajadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrabajadorById = async (req, res) => {
  try {
    const trabajador = await trabajadorService.getTrabajadorById(req.params.id);
    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }
    res.json(trabajador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTrabajador = async (req, res) => {
  try {
    const result = await trabajadorService.createTrabajador(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTrabajador = async (req, res) => {
  try {
    const result = await trabajadorService.updateTrabajador(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTrabajador = async (req, res) => {
  try {
    const result = await trabajadorService.deleteTrabajador(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

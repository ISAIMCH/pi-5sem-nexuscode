const obraService = require('../services/obraService');

exports.getAllObras = async (req, res) => {
  try {
    const obras = await obraService.getAllObras();
    res.json(obras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getObraById = async (req, res) => {
  try {
    const obra = await obraService.getObraById(req.params.id);
    if (!obra) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    res.json(obra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getObraResumen = async (req, res) => {
  try {
    const resumen = await obraService.getObraResumen(req.params.id);
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createObra = async (req, res) => {
  try {
    const result = await obraService.createObra(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateObra = async (req, res) => {
  try {
    const result = await obraService.updateObra(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteObra = async (req, res) => {
  try {
    const result = await obraService.deleteObra(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

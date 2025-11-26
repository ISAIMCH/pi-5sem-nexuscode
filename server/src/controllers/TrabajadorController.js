const trabajadorService = require('../services/TrabajadorService');

exports.getAllTrabajadores = async (req, res) => {
  try {
    const trabajadores = await trabajadorService.getAllTrabajadores();
    res.json(trabajadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrabajadoresByObra = async (req, res) => {
  try {
    const { obraId } = req.params;
    if (!obraId) {
      return res.status(400).json({ error: 'ObraID is required' });
    }
    const trabajadores = await trabajadorService.getTrabajadoresByObra(obraId);
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
    console.log('TrabajadorController.createTrabajador - Datos recibidos:', req.body);
    const result = await trabajadorService.createTrabajador(req.body);
    console.log('TrabajadorController.createTrabajador - Resultado:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('TrabajadorController.createTrabajador - Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateTrabajador = async (req, res) => {
  try {
    console.log('TrabajadorController.updateTrabajador - ID:', req.params.id);
    console.log('TrabajadorController.updateTrabajador - Datos recibidos:', req.body);
    const result = await trabajadorService.updateTrabajador(req.params.id, req.body);
    console.log('TrabajadorController.updateTrabajador - Resultado:', result);
    res.json(result);
  } catch (error) {
    console.error('TrabajadorController.updateTrabajador - Error:', error.message);
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

exports.assignTrabajadorToObra = async (req, res) => {
  try {
    const { id } = req.params;
    const { obraId } = req.body;
    if (!obraId) {
      return res.status(400).json({ error: 'ObraID is required' });
    }
    const result = await trabajadorService.assignTrabajadorToObra(id, obraId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeTrabajadorFromObra = async (req, res) => {
  try {
    const { id } = req.params;
    const { obraId } = req.body;
    if (!obraId) {
      return res.status(400).json({ error: 'ObraID is required' });
    }
    await trabajadorService.removeTrabajadorFromObra(id, obraId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

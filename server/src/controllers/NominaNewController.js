const NominaService = require('../services/NominaService');

class NominaController {
  // Obtener todos los pagos de una obra
  static async getByObra(req, res) {
    try {
      const { obraID } = req.params;
      const pagos = await NominaService.getPagosByObra(parseInt(obraID));
      res.status(200).json(pagos);
    } catch (error) {
      console.error('Error in getByObra:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener trabajadores de una obra
  static async getTrabajadoresByObra(req, res) {
    try {
      const { obraID } = req.params;
      const trabajadores = await NominaService.getTrabajadoresByObra(parseInt(obraID));
      res.status(200).json(trabajadores);
    } catch (error) {
      console.error('Error in getTrabajadoresByObra:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Crear un nuevo pago de nómina
  static async create(req, res) {
    try {
      const { ObraID, TrabajadorID, FechaPago, MontoPagado, PeriodoInicio, PeriodoFin, EstatusPago, Concepto, Observaciones } = req.body;
      
      if (!ObraID || !TrabajadorID || !FechaPago || !MontoPagado) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const result = await NominaService.createPago({
        ObraID,
        TrabajadorID,
        FechaPago,
        MontoPagado,
        PeriodoInicio,
        PeriodoFin,
        EstatusPago: EstatusPago || 'Pendiente',
        Concepto,
        Observaciones
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Error in create:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Crear lote de nómina semanal
  static async createLote(req, res) {
    try {
      const { pagosList } = req.body;

      if (!Array.isArray(pagosList) || pagosList.length === 0) {
        return res.status(400).json({ error: 'pagosList debe ser un array no vacío' });
      }

      const result = await NominaService.createLoteNomina(pagosList);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createLote:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Eliminar un pago
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await NominaService.deletePago(parseInt(id));
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Actualizar un pago
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { FechaPago, PeriodoInicio, PeriodoFin, MontoPagado, EstatusPago, Concepto, Observaciones } = req.body;

      const result = await NominaService.updatePago(parseInt(id), {
        FechaPago,
        PeriodoInicio,
        PeriodoFin,
        MontoPagado,
        EstatusPago,
        Concepto,
        Observaciones
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NominaController;

const { sql, poolPromise } = require('../config/database');

exports.getAllNomina = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT pn.NominaID, pn.ObraID, pn.TrabajadorID, pn.FechaPago, pn.MontoPagado,
             t.NombreCompleto as TrabajadorNombre, t.Puesto
      FROM PagoNomina pn
      LEFT JOIN Trabajador t ON pn.TrabajadorID = t.TrabajadorID
      ORDER BY pn.FechaPago DESC
    `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getAllNomina:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getNominaByObra = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { obraId } = req.params;
    const query = `
      SELECT pn.NominaID, pn.ObraID, pn.TrabajadorID, pn.FechaPago, pn.MontoPagado,
             t.NombreCompleto as TrabajadorNombre, t.Puesto
      FROM PagoNomina pn
      LEFT JOIN Trabajador t ON pn.TrabajadorID = t.TrabajadorID
      WHERE pn.ObraID = @obraId
      ORDER BY pn.FechaPago DESC
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, obraId)
      .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getNominaByObra:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createNomina = async (req, res) => {
  try {
    const { ObraID, TrabajadorID, FechaPago, MontoPagado, Comprobante } = req.body;
    const pool = await poolPromise;
    const query = `
      INSERT INTO PagoNomina (ObraID, TrabajadorID, FechaPago, MontoPagado)
      VALUES (@obraId, @trabajadorId, @fechaPago, @montoPagado);
      SELECT @@IDENTITY as NominaID;
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, ObraID)
      .input('trabajadorId', sql.Int, TrabajadorID)
      .input('fechaPago', sql.DateTime, FechaPago)
      .input('montoPagado', sql.Decimal(10, 2), MontoPagado)
      .query(query);
    
    res.status(201).json({ 
      NominaID: result.recordset[0].NominaID, 
      ObraID, 
      TrabajadorID, 
      FechaPago, 
      MontoPagado, 
      Comprobante 
    });
  } catch (error) {
    console.error('Error en createNomina:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateNomina = async (req, res) => {
  try {
    const { ObraID, TrabajadorID, FechaPago, MontoPagado, Comprobante } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    const query = `
      UPDATE PagoNomina
      SET ObraID = @obraId, TrabajadorID = @trabajadorId, FechaPago = @fechaPago, 
          MontoPagado = @montoPagado
      WHERE NominaID = @id
    `;
    await pool.request()
      .input('id', sql.Int, id)
      .input('obraId', sql.Int, ObraID)
      .input('trabajadorId', sql.Int, TrabajadorID)
      .input('fechaPago', sql.DateTime, FechaPago)
      .input('montoPagado', sql.Decimal(10, 2), MontoPagado)
      .query(query);
    
    res.json({ NominaID: id, ObraID, TrabajadorID, FechaPago, MontoPagado, Comprobante });
  } catch (error) {
    console.error('Error en updateNomina:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNomina = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const query = 'DELETE FROM PagoNomina WHERE NominaID = @id';
    await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    res.json({ success: true, message: 'Pago eliminado' });
  } catch (error) {
    console.error('Error en deleteNomina:', error);
    res.status(500).json({ error: error.message });
  }
};

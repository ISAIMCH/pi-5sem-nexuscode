const { sql, poolPromise } = require('../config/database');

exports.getAllRetenciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT r.RetencionID, r.ObraID, r.TipoRetencionID, r.Fecha, r.Monto, r.EstatusID,
             tr.Nombre as ConceptoNombre,
             ce.Nombre as EstatusNombre
      FROM Retencion r
      LEFT JOIN Cat_TipoRetencion tr ON r.TipoRetencionID = tr.TipoRetencionID
      LEFT JOIN Cat_Estatus ce ON r.EstatusID = ce.EstatusID
      ORDER BY r.Fecha DESC
    `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getAllRetenciones:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRetencionesByObra = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { obraId } = req.params;
    const query = `
      SELECT r.RetencionID, r.ObraID, r.TipoRetencionID, r.Fecha, r.Monto, r.EstatusID,
             tr.Nombre as ConceptoNombre,
             ce.Nombre as EstatusNombre
      FROM Retencion r
      LEFT JOIN Cat_TipoRetencion tr ON r.TipoRetencionID = tr.TipoRetencionID
      LEFT JOIN Cat_Estatus ce ON r.EstatusID = ce.EstatusID
      WHERE r.ObraID = @obraId
      ORDER BY r.Fecha DESC
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, obraId)
      .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getRetencionesByObra:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createRetencion = async (req, res) => {
  try {
    const { ObraID, TipoRetencionID, Fecha, Monto, EstatusID, Documento } = req.body;
    const pool = await poolPromise;
    const query = `
      INSERT INTO Retencion (ObraID, TipoRetencionID, Fecha, Monto, EstatusID)
      VALUES (@obraId, @tipoRetencionId, @fecha, @monto, @estatusId);
      SELECT @@IDENTITY as RetencionID;
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, ObraID)
      .input('tipoRetencionId', sql.Int, TipoRetencionID)
      .input('fecha', sql.DateTime, Fecha)
      .input('monto', sql.Decimal(10, 2), Monto)
      .input('estatusId', sql.Int, EstatusID || 1)
      .query(query);
    
    res.status(201).json({ 
      RetencionID: result.recordset[0].RetencionID, 
      ObraID, 
      TipoRetencionID, 
      Fecha, 
      Monto, 
      EstatusID: EstatusID || 1,
      Documento
    });
  } catch (error) {
    console.error('Error en createRetencion:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateRetencion = async (req, res) => {
  try {
    const { ObraID, TipoRetencionID, Fecha, Monto, EstatusID, Documento } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    const query = `
      UPDATE Retencion
      SET ObraID = @obraId, TipoRetencionID = @tipoRetencionId, Fecha = @fecha, 
          Monto = @monto, EstatusID = @estatusId
      WHERE RetencionID = @id
    `;
    await pool.request()
      .input('id', sql.Int, id)
      .input('obraId', sql.Int, ObraID)
      .input('tipoRetencionId', sql.Int, TipoRetencionID)
      .input('fecha', sql.DateTime, Fecha)
      .input('monto', sql.Decimal(10, 2), Monto)
      .input('estatusId', sql.Int, EstatusID)
      .query(query);
    
    res.json({ RetencionID: id, ObraID, TipoRetencionID, Fecha, Monto, EstatusID, Documento });
  } catch (error) {
    console.error('Error en updateRetencion:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRetencion = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const query = 'DELETE FROM Retencion WHERE RetencionID = @id';
    await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    res.json({ success: true, message: 'Retención eliminada' });
  } catch (error) {
    console.error('Error en deleteRetencion:', error);
    res.status(500).json({ error: error.message });
  }
};

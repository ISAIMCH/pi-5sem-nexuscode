const { sql, poolPromise } = require('../config/database');

exports.getAllMaquinaria = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT rm.RentaID, rm.ObraID, rm.ProveedorID, rm.Descripcion, rm.FechaInicio, 
             rm.FechaFin, rm.CostoTotal, rm.FacturaRuta,
             p.Nombre as ProveedorNombre
      FROM RentaMaquinaria rm
      LEFT JOIN Proveedor p ON rm.ProveedorID = p.ProveedorID
      ORDER BY rm.FechaInicio DESC
    `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getAllMaquinaria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMaquinariaByObra = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { obraId } = req.params;
    const query = `
      SELECT rm.RentaID, rm.ObraID, rm.ProveedorID, rm.Descripcion, rm.FechaInicio, 
             rm.FechaFin, rm.CostoTotal, rm.FacturaRuta,
             p.Nombre as ProveedorNombre
      FROM RentaMaquinaria rm
      LEFT JOIN Proveedor p ON rm.ProveedorID = p.ProveedorID
      WHERE rm.ObraID = @obraId
      ORDER BY rm.FechaInicio DESC
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, obraId)
      .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getMaquinariaByObra:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createMaquinaria = async (req, res) => {
  try {
    const { ObraID, ProveedorID, Descripcion, FechaInicio, FechaFin, CostoTotal, FacturaRuta } = req.body;
    
    console.log('📝 [CREATE MAQUINARIA] Datos recibidos:');
    console.log('  ObraID:', ObraID);
    console.log('  ProveedorID:', ProveedorID);
    console.log('  Descripcion:', Descripcion);
    console.log('  FechaInicio:', FechaInicio);
    console.log('  FechaFin:', FechaFin);
    console.log('  CostoTotal:', CostoTotal);
    console.log('  FacturaRuta:', FacturaRuta);
    console.log('  FacturaRuta type:', typeof FacturaRuta);
    console.log('  FacturaRuta length:', FacturaRuta ? FacturaRuta.length : 'null');
    console.log('📝 Full req.body:', JSON.stringify(req.body, null, 2));
    
    const pool = await poolPromise;
    const query = `
      INSERT INTO RentaMaquinaria (ObraID, ProveedorID, Descripcion, FechaInicio, FechaFin, CostoTotal, FacturaRuta)
      VALUES (@obraId, @proveedorId, @descripcion, @fechaInicio, @fechaFin, @costoTotal, @facturaRuta);
      SELECT @@IDENTITY as RentaID;
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, ObraID)
      .input('proveedorId', sql.Int, ProveedorID)
      .input('descripcion', sql.NVarChar, Descripcion)
      .input('fechaInicio', sql.DateTime, FechaInicio)
      .input('fechaFin', sql.DateTime, FechaFin)
      .input('costoTotal', sql.Decimal(10, 2), CostoTotal)
      .input('facturaRuta', sql.NVarChar(sql.MAX), FacturaRuta || null)
      .query(query);
    
    console.log('✅ [CREATE MAQUINARIA] Registro insertado con RentaID:', result.recordset[0].RentaID);
    
    res.status(201).json({ RentaID: result.recordset[0].RentaID, ...req.body });
  } catch (error) {
    console.error('❌ Error en createMaquinaria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMaquinaria = async (req, res) => {
  try {
    const { Descripcion, FechaInicio, FechaFin, CostoTotal, FacturaRuta } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    const query = `
      UPDATE RentaMaquinaria
      SET Descripcion = @descripcion,
          FechaInicio = @fechaInicio, 
          FechaFin = @fechaFin, 
          CostoTotal = @costoTotal, 
          FacturaRuta = @facturaRuta
      WHERE RentaID = @id
    `;
    await pool.request()
      .input('id', sql.Int, id)
      .input('descripcion', sql.NVarChar, Descripcion)
      .input('fechaInicio', sql.DateTime, FechaInicio)
      .input('fechaFin', sql.DateTime, FechaFin || null)
      .input('costoTotal', sql.Decimal(10, 2), CostoTotal)
      .input('facturaRuta', sql.NVarChar(sql.MAX), FacturaRuta || null)
      .query(query);
    
    res.json({ RentaID: id, ...req.body });
  } catch (error) {
    console.error('Error en updateMaquinaria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMaquinaria = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const query = 'DELETE FROM RentaMaquinaria WHERE RentaID = @id';
    await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    res.json({ success: true, message: 'Equipo eliminado' });
  } catch (error) {
    console.error('Error en deleteMaquinaria:', error);
    res.status(500).json({ error: error.message });
  }
};

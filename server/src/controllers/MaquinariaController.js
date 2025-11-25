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
    const { ObraID, ProveedorID, Descripcion, FechaInicio, FechaFin, CostoTotal } = req.body;
    const pool = await poolPromise;
    
    // Generar ruta del archivo si existe
    let facturaRuta = null;
    if (req.file) {
      // Ruta relativa desde el servidor
      facturaRuta = `/uploads/facturas/${req.file.filename}`;
    }
    
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
      .input('facturaRuta', sql.NVarChar, facturaRuta)
      .query(query);
    
    res.status(201).json({ RentaID: result.recordset[0].RentaID, FacturaRuta: facturaRuta, ...req.body });
  } catch (error) {
    console.error('Error en createMaquinaria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMaquinaria = async (req, res) => {
  try {
    const { ObraID, ProveedorID, Descripcion, FechaInicio, FechaFin, CostoTotal } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    
    // Si hay nuevo archivo, actualizar la ruta
    let updateQuery = `
      UPDATE RentaMaquinaria
      SET ObraID = @obraId, ProveedorID = @proveedorId, Descripcion = @descripcion,
          FechaInicio = @fechaInicio, FechaFin = @fechaFin, CostoTotal = @costoTotal
    `;
    
    const request = pool.request()
      .input('id', sql.Int, id)
      .input('obraId', sql.Int, ObraID)
      .input('proveedorId', sql.Int, ProveedorID)
      .input('descripcion', sql.NVarChar, Descripcion)
      .input('fechaInicio', sql.DateTime, FechaInicio)
      .input('fechaFin', sql.DateTime, FechaFin)
      .input('costoTotal', sql.Decimal(10, 2), CostoTotal);
    
    if (req.file) {
      updateQuery += `, FacturaRuta = @facturaRuta`;
      request.input('facturaRuta', sql.NVarChar, `/uploads/facturas/${req.file.filename}`);
    }
    
    updateQuery += ` WHERE RentaID = @id`;
    
    await request.query(updateQuery);
    
    const facturaRuta = req.file ? `/uploads/facturas/${req.file.filename}` : null;
    res.json({ RentaID: id, FacturaRuta: facturaRuta, ...req.body });
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

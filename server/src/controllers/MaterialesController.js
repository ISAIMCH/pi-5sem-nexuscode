const { sql, poolPromise } = require('../config/database');

exports.getAllMateriales = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT cm.CompraID, cm.ObraID, cm.ProveedorID, cm.Fecha, cm.FolioFactura, cm.TotalCompra, cm.FacturaRuta,
             p.Nombre as ProveedorNombre
      FROM CompraMaterial cm
      LEFT JOIN Proveedor p ON cm.ProveedorID = p.ProveedorID
      ORDER BY cm.Fecha DESC
    `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getAllMateriales:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMaterialesByObra = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { obraId } = req.params;
    const query = `
      SELECT cm.CompraID, cm.ObraID, cm.ProveedorID, cm.Fecha, cm.FolioFactura, cm.TotalCompra, cm.FacturaRuta,
             p.Nombre as ProveedorNombre
      FROM CompraMaterial cm
      LEFT JOIN Proveedor p ON cm.ProveedorID = p.ProveedorID
      WHERE cm.ObraID = @obraId
      ORDER BY cm.Fecha DESC
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, obraId)
      .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getMaterialesByObra:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { ObraID, ProveedorID, Fecha, FolioFactura, TotalCompra } = req.body;
    const pool = await poolPromise;
    
    // Generar ruta del archivo si existe
    let facturaRuta = null;
    if (req.file) {
      // Ruta relativa desde el servidor
      facturaRuta = `/uploads/facturas/${req.file.filename}`;
    }
    
    const query = `
      INSERT INTO CompraMaterial (ObraID, ProveedorID, Fecha, FolioFactura, TotalCompra, FacturaRuta)
      VALUES (@obraId, @proveedorId, @fecha, @folioFactura, @totalCompra, @facturaRuta);
      SELECT @@IDENTITY as CompraID;
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, ObraID)
      .input('proveedorId', sql.Int, ProveedorID)
      .input('fecha', sql.DateTime, Fecha)
      .input('folioFactura', sql.NVarChar, FolioFactura)
      .input('totalCompra', sql.Decimal(10, 2), TotalCompra)
      .input('facturaRuta', sql.NVarChar, facturaRuta)
      .query(query);
    
    res.status(201).json({ CompraID: result.recordset[0].CompraID, FacturaRuta: facturaRuta, ...req.body });
  } catch (error) {
    console.error('Error en createMaterial:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { ObraID, ProveedorID, Fecha, FolioFactura, TotalCompra } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    
    // Si hay nuevo archivo, actualizar la ruta
    let updateQuery = `
      UPDATE CompraMaterial
      SET ObraID = @obraId, ProveedorID = @proveedorId, Fecha = @fecha, 
          FolioFactura = @folioFactura, TotalCompra = @totalCompra
    `;
    
    const request = pool.request()
      .input('id', sql.Int, id)
      .input('obraId', sql.Int, ObraID)
      .input('proveedorId', sql.Int, ProveedorID)
      .input('fecha', sql.DateTime, Fecha)
      .input('folioFactura', sql.NVarChar, FolioFactura)
      .input('totalCompra', sql.Decimal(10, 2), TotalCompra);
    
    if (req.file) {
      updateQuery += `, FacturaRuta = @facturaRuta`;
      request.input('facturaRuta', sql.NVarChar, `/uploads/facturas/${req.file.filename}`);
    }
    
    updateQuery += ` WHERE CompraID = @id`;
    
    await request.query(updateQuery);
    
    const facturaRuta = req.file ? `/uploads/facturas/${req.file.filename}` : null;
    res.json({ CompraID: id, FacturaRuta: facturaRuta, ...req.body });
  } catch (error) {
    console.error('Error en updateMaterial:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const query = 'DELETE FROM CompraMaterial WHERE CompraID = @id';
    await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    res.json({ success: true, message: 'Material eliminado' });
  } catch (error) {
    console.error('Error en deleteMaterial:', error);
    res.status(500).json({ error: error.message });
  }
};

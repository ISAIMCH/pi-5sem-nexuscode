const { sql, poolPromise } = require('../config/database');

exports.getAllMateriales = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT cm.CompraID, cm.ObraID, cm.ProveedorID, cm.Fecha, cm.TotalCompra, cm.FacturaRuta,
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
      SELECT cm.CompraID, cm.ObraID, cm.ProveedorID, cm.Fecha, cm.TotalCompra, cm.FacturaRuta,
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
    const { ObraID, ProveedorID, Fecha, TotalCompra, FacturaRuta } = req.body;
    
    console.log('📝 [CREATE MATERIAL] Datos recibidos:');
    console.log('  ObraID:', ObraID);
    console.log('  ProveedorID:', ProveedorID);
    console.log('  Fecha:', Fecha);
    console.log('  TotalCompra:', TotalCompra);
    console.log('  FacturaRuta:', FacturaRuta);
    console.log('  FacturaRuta type:', typeof FacturaRuta);
    console.log('  FacturaRuta length:', FacturaRuta ? FacturaRuta.length : 'null');
    console.log('📝 Full req.body:', JSON.stringify(req.body, null, 2));
    
    const pool = await poolPromise;
    const query = `
      INSERT INTO CompraMaterial (ObraID, ProveedorID, Fecha, TotalCompra, FacturaRuta)
      VALUES (@obraId, @proveedorId, @fecha, @totalCompra, @facturaRuta);
      SELECT @@IDENTITY as CompraID;
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, ObraID)
      .input('proveedorId', sql.Int, ProveedorID)
      .input('fecha', sql.DateTime, Fecha)
      .input('totalCompra', sql.Decimal(10, 2), TotalCompra)
      .input('facturaRuta', sql.NVarChar(sql.MAX), FacturaRuta || null)
      .query(query);
    
    console.log('✅ [CREATE MATERIAL] Registro insertado con CompraID:', result.recordset[0].CompraID);
    
    res.status(201).json({ CompraID: result.recordset[0].CompraID, ...req.body });
  } catch (error) {
    console.error('❌ Error en createMaterial:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { Fecha, TotalCompra, FacturaRuta } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    const query = `
      UPDATE CompraMaterial
      SET Fecha = @fecha, 
          TotalCompra = @totalCompra,
          FacturaRuta = @facturaRuta
      WHERE CompraID = @id
    `;
    await pool.request()
      .input('id', sql.Int, id)
      .input('fecha', sql.DateTime, Fecha)
      .input('totalCompra', sql.Decimal(18, 2), TotalCompra)
      .input('facturaRuta', sql.NVarChar(sql.MAX), FacturaRuta || null)
      .query(query);
    
    res.json({ CompraID: id, ...req.body });
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

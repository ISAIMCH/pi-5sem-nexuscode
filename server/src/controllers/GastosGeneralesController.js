const { sql, poolPromise } = require('../config/database');

exports.getAllGastosGenerales = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT gg.GastoID, gg.ObraID, gg.Fecha, gg.CategoriaID, gg.Descripcion, 
             gg.ProveedorID, gg.Monto, gg.FacturaRef,
             ccg.Nombre as CategoriaNombre,
             p.Nombre as ProveedorNombre
      FROM GastoGeneral gg
      LEFT JOIN Cat_CategoriaGasto ccg ON gg.CategoriaID = ccg.CategoriaID
      LEFT JOIN Proveedor p ON gg.ProveedorID = p.ProveedorID
      ORDER BY gg.Fecha DESC
    `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getAllGastosGenerales:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getGastosGeneralesByObra = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { obraId } = req.params;
    const query = `
      SELECT gg.GastoID, gg.ObraID, gg.Fecha, gg.CategoriaID, gg.Descripcion, 
             gg.ProveedorID, gg.Monto, gg.FacturaRef,
             ccg.Nombre as CategoriaNombre,
             p.Nombre as ProveedorNombre
      FROM GastoGeneral gg
      LEFT JOIN Cat_CategoriaGasto ccg ON gg.CategoriaID = ccg.CategoriaID
      LEFT JOIN Proveedor p ON gg.ProveedorID = p.ProveedorID
      WHERE gg.ObraID = @obraId
      ORDER BY gg.Fecha DESC
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, obraId)
      .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getGastosGeneralesByObra:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createGastoGeneral = async (req, res) => {
  try {
    const { ObraID, Fecha, CategoriaID, Descripcion, ProveedorID, Monto, FacturaRef } = req.body;
    const pool = await poolPromise;
    const query = `
      INSERT INTO GastoGeneral (ObraID, Fecha, CategoriaID, Descripcion, ProveedorID, Monto, FacturaRef)
      VALUES (@obraId, @fecha, @categoriaId, @descripcion, @proveedorId, @monto, @facturaRef);
      SELECT @@IDENTITY as GastoID;
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, ObraID)
      .input('fecha', sql.DateTime, Fecha)
      .input('categoriaId', sql.Int, CategoriaID)
      .input('descripcion', sql.NVarChar, Descripcion)
      .input('proveedorId', sql.Int, ProveedorID)
      .input('monto', sql.Decimal(10, 2), Monto)
      .input('facturaRef', sql.NVarChar, FacturaRef)
      .query(query);
    
    res.status(201).json({ GastoID: result.recordset[0].GastoID, ...req.body });
  } catch (error) {
    console.error('Error en createGastoGeneral:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateGastoGeneral = async (req, res) => {
  try {
    const { ObraID, Fecha, CategoriaID, Descripcion, ProveedorID, Monto, FacturaRef } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    const query = `
      UPDATE GastoGeneral
      SET ObraID = @obraId, Fecha = @fecha, CategoriaID = @categoriaId, Descripcion = @descripcion,
          ProveedorID = @proveedorId, Monto = @monto, FacturaRef = @facturaRef
      WHERE GastoID = @id
    `;
    await pool.request()
      .input('id', sql.Int, id)
      .input('obraId', sql.Int, ObraID)
      .input('fecha', sql.DateTime, Fecha)
      .input('categoriaId', sql.Int, CategoriaID)
      .input('descripcion', sql.NVarChar, Descripcion)
      .input('proveedorId', sql.Int, ProveedorID)
      .input('monto', sql.Decimal(10, 2), Monto)
      .input('facturaRef', sql.NVarChar, FacturaRef)
      .query(query);
    
    res.json({ GastoID: id, ...req.body });
  } catch (error) {
    console.error('Error en updateGastoGeneral:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGastoGeneral = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const query = 'DELETE FROM GastoGeneral WHERE GastoID = @id';
    await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    res.json({ success: true, message: 'Gasto eliminado' });
  } catch (error) {
    console.error('Error en deleteGastoGeneral:', error);
    res.status(500).json({ error: error.message });
  }
};

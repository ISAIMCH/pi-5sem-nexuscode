const { sql, poolPromise } = require('../config/database');

class GastoService {
  async getAllGastos() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT g.*, o.Nombre as ObraNombre, cg.Nombre as CategoriaNombre, p.Nombre as ProveedorNombre
         FROM GastoGeneral g
         LEFT JOIN Obra o ON g.ObraID = o.ObraID
         LEFT JOIN Cat_CategoriaGasto cg ON g.CategoriaID = cg.CategoriaID
         LEFT JOIN Proveedor p ON g.ProveedorID = p.ProveedorID
         ORDER BY g.Fecha DESC`
      );
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getGastosByObra(obraId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ObraID', sql.Int, obraId)
        .query(
          `SELECT g.*, cg.Nombre as CategoriaNombre, p.Nombre as ProveedorNombre
           FROM GastoGeneral g
           LEFT JOIN Cat_CategoriaGasto cg ON g.CategoriaID = cg.CategoriaID
           LEFT JOIN Proveedor p ON g.ProveedorID = p.ProveedorID
           WHERE g.ObraID = @ObraID
           ORDER BY g.Fecha DESC`
        );
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async createGasto(gasto) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ObraID', sql.Int, gasto.ObraID)
        .input('Fecha', sql.Date, gasto.Fecha)
        .input('CategoriaID', sql.Int, gasto.CategoriaID)
        .input('Descripcion', sql.NVarChar, gasto.Descripcion)
        .input('ProveedorID', sql.Int, gasto.ProveedorID || null)
        .input('Monto', sql.Decimal(18, 2), gasto.Monto)
        .input('FacturaRef', sql.NVarChar, gasto.FacturaRef || null)
        .query(
          `INSERT INTO GastoGeneral (ObraID, Fecha, CategoriaID, Descripcion, ProveedorID, Monto, FacturaRef)
           OUTPUT INSERTED.GastoID
           VALUES (@ObraID, @Fecha, @CategoriaID, @Descripcion, @ProveedorID, @Monto, @FacturaRef)`
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async updateGasto(id, gasto) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('GastoID', sql.Int, id)
        .input('Fecha', sql.Date, gasto.Fecha)
        .input('CategoriaID', sql.Int, gasto.CategoriaID)
        .input('Descripcion', sql.NVarChar, gasto.Descripcion)
        .input('ProveedorID', sql.Int, gasto.ProveedorID || null)
        .input('Monto', sql.Decimal(18, 2), gasto.Monto)
        .input('FacturaRef', sql.NVarChar, gasto.FacturaRef || null)
        .query(
          `UPDATE GastoGeneral
           SET Fecha = @Fecha, CategoriaID = @CategoriaID, Descripcion = @Descripcion,
               ProveedorID = @ProveedorID, Monto = @Monto, FacturaRef = @FacturaRef
           WHERE GastoID = @GastoID`
        );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async deleteGasto(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('GastoID', sql.Int, id)
        .query('DELETE FROM GastoGeneral WHERE GastoID = @GastoID');
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new GastoService();

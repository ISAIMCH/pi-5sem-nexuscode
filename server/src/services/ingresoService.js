const { sql, poolPromise } = require('../config/database');

class IngresoService {
  async getAllIngresos() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT i.*, o.Nombre as ObraNombre, cti.Nombre as TipoNombre
         FROM Ingreso i
         LEFT JOIN Obra o ON i.ObraID = o.ObraID
         LEFT JOIN Cat_TipoIngreso cti ON i.TipoIngresoID = cti.TipoIngresoID
         ORDER BY i.Fecha DESC`
      );
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getIngresosByObra(obraId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ObraID', sql.Int, obraId)
        .query(
          `SELECT i.*, cti.Nombre as TipoNombre
           FROM Ingreso i
           LEFT JOIN Cat_TipoIngreso cti ON i.TipoIngresoID = cti.TipoIngresoID
           WHERE i.ObraID = @ObraID
           ORDER BY i.Fecha DESC`
        );
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async createIngreso(ingreso) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ObraID', sql.Int, ingreso.ObraID)
        .input('Fecha', sql.Date, ingreso.Fecha)
        .input('TipoIngresoID', sql.Int, ingreso.TipoIngresoID)
        .input('Descripcion', sql.NVarChar, ingreso.Descripcion)
        .input('Monto', sql.Decimal(18, 2), ingreso.Monto)
        .input('FacturaRef', sql.NVarChar, ingreso.FacturaRef || null)
        .query(
          `INSERT INTO Ingreso (ObraID, Fecha, TipoIngresoID, Descripcion, Monto, FacturaRef)
           OUTPUT INSERTED.IngresoID
           VALUES (@ObraID, @Fecha, @TipoIngresoID, @Descripcion, @Monto, @FacturaRef)`
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async updateIngreso(id, ingreso) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('IngresoID', sql.Int, id)
        .input('Fecha', sql.Date, ingreso.Fecha)
        .input('TipoIngresoID', sql.Int, ingreso.TipoIngresoID)
        .input('Descripcion', sql.NVarChar, ingreso.Descripcion)
        .input('Monto', sql.Decimal(18, 2), ingreso.Monto)
        .input('FacturaRef', sql.NVarChar, ingreso.FacturaRef || null)
        .query(
          `UPDATE Ingreso
           SET Fecha = @Fecha, TipoIngresoID = @TipoIngresoID, Descripcion = @Descripcion,
               Monto = @Monto, FacturaRef = @FacturaRef
           WHERE IngresoID = @IngresoID`
        );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async deleteIngreso(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('IngresoID', sql.Int, id)
        .query('DELETE FROM Ingreso WHERE IngresoID = @IngresoID');
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new IngresoService();

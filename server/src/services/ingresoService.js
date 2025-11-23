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
      console.error('IngresoService.getAllIngresos error:', error.message);
      throw new Error(`Error fetching ingresos: ${error.message}`);
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
      console.error('IngresoService.getIngresosByObra error:', error.message);
      throw new Error(`Error fetching ingresos for obra ${obraId}: ${error.message}`);
    }
  }

  async createIngreso(ingreso) {
    try {
      console.log('Creating ingreso with data:', ingreso);
      
      if (!ingreso.ObraID || !ingreso.TipoIngresoID || !ingreso.Fecha || !ingreso.Monto) {
        throw new Error('Missing required fields: ObraID, TipoIngresoID, Fecha, Monto');
      }

      const pool = await poolPromise;
      console.log('Pool obtained, executing INSERT query...');
      
      const result = await pool
        .request()
        .input('ObraID', sql.Int, ingreso.ObraID)
        .input('Fecha', sql.Date, ingreso.Fecha)
        .input('TipoIngresoID', sql.Int, ingreso.TipoIngresoID)
        .input('Descripcion', sql.NVarChar(500), ingreso.Descripcion)
        .input('Monto', sql.Decimal(18, 2), ingreso.Monto)
        .input('FacturaRef', sql.NVarChar(100), ingreso.FacturaRef || null)
        .query(
          `INSERT INTO Ingreso (ObraID, Fecha, TipoIngresoID, Descripcion, Monto, FacturaRef)
           OUTPUT INSERTED.IngresoID, INSERTED.Fecha, INSERTED.Monto
           VALUES (@ObraID, @Fecha, @TipoIngresoID, @Descripcion, @Monto, @FacturaRef)`
        );
      
      console.log('INSERT executed. Recordset:', result.recordset);
      
      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('INSERT query executed but no record returned');
      }
      
      console.log('Ingreso created successfully:', result.recordset[0]);
      return result.recordset[0];
    } catch (error) {
      console.error('IngresoService.createIngreso error:', error.message);
      throw new Error(`Error creating ingreso: ${error.message}`);
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
        .input('Descripcion', sql.NVarChar(500), ingreso.Descripcion)
        .input('Monto', sql.Decimal(18, 2), ingreso.Monto)
        .input('FacturaRef', sql.NVarChar(100), ingreso.FacturaRef || null)
        .query(
          `UPDATE Ingreso
           SET Fecha = @Fecha, TipoIngresoID = @TipoIngresoID, Descripcion = @Descripcion,
               Monto = @Monto, FacturaRef = @FacturaRef
           WHERE IngresoID = @IngresoID`
        );
      return { success: true };
    } catch (error) {
      console.error('IngresoService.updateIngreso error:', error.message);
      throw new Error(`Error updating ingreso: ${error.message}`);
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
      console.error('IngresoService.deleteIngreso error:', error.message);
      throw new Error(`Error deleting ingreso: ${error.message}`);
    }
  }
}

module.exports = new IngresoService();

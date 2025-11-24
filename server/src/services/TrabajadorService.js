const { sql, poolPromise } = require('../config/database');

class TrabajadorService {
  async getAllTrabajadores() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT t.*, ce.Nombre as EstatusNombre
         FROM Trabajador t
         LEFT JOIN Cat_Estatus ce ON t.EstatusID = ce.EstatusID
         ORDER BY t.TrabajadorID DESC`
      );
      return result.recordset;
    } catch (error) {
      console.error('TrabajadorService.getAllTrabajadores error:', error.message);
      throw new Error(`Error fetching trabajadores: ${error.message}`);
    }
  }

  async getTrabajadorById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('TrabajadorID', sql.Int, id)
        .query(
          `SELECT t.*, ce.Nombre as EstatusNombre
           FROM Trabajador t
           LEFT JOIN Cat_Estatus ce ON t.EstatusID = ce.EstatusID
           WHERE t.TrabajadorID = @TrabajadorID`
        );
      return result.recordset[0];
    } catch (error) {
      console.error('TrabajadorService.getTrabajadorById error:', error.message);
      throw new Error(`Error fetching trabajador ${id}: ${error.message}`);
    }
  }

  async createTrabajador(trabajador) {
    try {
      console.log('Creating trabajador with data:', trabajador);
      
      if (!trabajador.NombreCompleto || !trabajador.Puesto) {
        throw new Error('Missing required fields: NombreCompleto, Puesto');
      }

      const pool = await poolPromise;
      console.log('Pool obtained, executing INSERT query...');
      
      const result = await pool
        .request()
        .input('NombreCompleto', sql.NVarChar(150), trabajador.NombreCompleto)
        .input('Puesto', sql.NVarChar(100), trabajador.Puesto)
        .input('NSS', sql.NVarChar(20), trabajador.NSS || null)
        .input('EstatusID', sql.Int, trabajador.EstatusID || 1)
        .query(
          `INSERT INTO Trabajador (NombreCompleto, Puesto, NSS, EstatusID)
           VALUES (@NombreCompleto, @Puesto, @NSS, @EstatusID);
           SELECT @@IDENTITY as TrabajadorID;`
        );
      
      console.log('INSERT executed. Recordset:', result.recordset);
      
      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('INSERT query executed but no record returned');
      }
      
      console.log('Trabajador created successfully:', result.recordset[0]);
      return result.recordset[0];
    } catch (error) {
      console.error('TrabajadorService.createTrabajador error:', error.message);
      throw new Error(`Error creating trabajador: ${error.message}`);
    }
  }

  async updateTrabajador(id, trabajador) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('TrabajadorID', sql.Int, id)
        .input('NombreCompleto', sql.NVarChar(150), trabajador.NombreCompleto)
        .input('Puesto', sql.NVarChar(100), trabajador.Puesto)
        .input('NSS', sql.NVarChar(20), trabajador.NSS || null)
        .input('EstatusID', sql.Int, trabajador.EstatusID)
        .query(
          `UPDATE Trabajador
           SET NombreCompleto = @NombreCompleto, Puesto = @Puesto, NSS = @NSS, EstatusID = @EstatusID
           WHERE TrabajadorID = @TrabajadorID`
        );
      return { success: true };
    } catch (error) {
      console.error('TrabajadorService.updateTrabajador error:', error.message);
      throw new Error(`Error updating trabajador: ${error.message}`);
    }
  }

  async deleteTrabajador(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('TrabajadorID', sql.Int, id)
        .query('DELETE FROM Trabajador WHERE TrabajadorID = @TrabajadorID');
      return { success: true };
    } catch (error) {
      console.error('TrabajadorService.deleteTrabajador error:', error.message);
      throw new Error(`Error deleting trabajador: ${error.message}`);
    }
  }
}

module.exports = new TrabajadorService();

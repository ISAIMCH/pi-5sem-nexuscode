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

  async getTrabajadoresByObra(obraId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ObraID', sql.Int, obraId)
        .query(
          `SELECT t.*, ce.Nombre as EstatusNombre
           FROM Trabajador t
           LEFT JOIN Cat_Estatus ce ON t.EstatusID = ce.EstatusID
           WHERE t.ObraActualID = @ObraID
           ORDER BY t.NombreCompleto`
        );
      return result.recordset;
    } catch (error) {
      console.error('TrabajadorService.getTrabajadoresByObra error:', error.message);
      throw new Error(`Error fetching trabajadores for obra ${obraId}: ${error.message}`);
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
      console.log('=== CREATE TRABAJADOR START ===');
      console.log('Datos recibidos:', trabajador);
      console.log('INERuta recibida:', trabajador.INERuta);
      
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
        .input('ClaveEmpleado', sql.NVarChar(20), trabajador.ClaveEmpleado || null)
        .input('ApellidoPaterno', sql.NVarChar(60), trabajador.ApellidoPaterno || null)
        .input('ApellidoMaterno', sql.NVarChar(60), trabajador.ApellidoMaterno || null)
        .input('Oficio', sql.NVarChar(100), trabajador.Oficio || null)
        .input('INE_Clave', sql.NVarChar(18), trabajador.INE_Clave || null)
        .input('CURP', sql.NVarChar(18), trabajador.CURP || null)
        .input('RFC', sql.NVarChar(13), trabajador.RFC || null)
        .input('FechaNacimiento', sql.Date, trabajador.FechaNacimiento || null)
        .input('Telefono', sql.NVarChar(20), trabajador.Telefono || null)
        .input('Correo', sql.NVarChar(100), trabajador.Correo || null)
        .input('Direccion', sql.NVarChar(250), trabajador.Direccion || null)
        .input('Banco', sql.NVarChar(50), trabajador.Banco || null)
        .input('CuentaBancaria', sql.NVarChar(20), trabajador.CuentaBancaria || null)
        .input('EsFacturador', sql.Bit, trabajador.EsFacturador || 0)
        .input('FechaIngreso', sql.Date, trabajador.FechaIngreso || null)
        .input('ObraActualID', sql.Int, trabajador.ObraActualID || null)
        .input('INERuta', sql.NVarChar(sql.MAX), trabajador.INERuta || null)
        .input('EstatusID', sql.Int, trabajador.EstatusID || 1)
        .query(
          `INSERT INTO Trabajador (NombreCompleto, Puesto, NSS, ClaveEmpleado, ApellidoPaterno, ApellidoMaterno, Oficio, INE_Clave, CURP, RFC, FechaNacimiento, Telefono, Correo, Direccion, Banco, CuentaBancaria, EsFacturador, FechaIngreso, ObraActualID, INERuta, EstatusID)
           VALUES (@NombreCompleto, @Puesto, @NSS, @ClaveEmpleado, @ApellidoPaterno, @ApellidoMaterno, @Oficio, @INE_Clave, @CURP, @RFC, @FechaNacimiento, @Telefono, @Correo, @Direccion, @Banco, @CuentaBancaria, @EsFacturador, @FechaIngreso, @ObraActualID, @INERuta, @EstatusID);
           SELECT @@IDENTITY as TrabajadorID;`
        );
      
      console.log('INSERT executed. Recordset:', result.recordset);
      
      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('INSERT query executed but no record returned');
      }
      
      const newTrabajador = result.recordset[0];
      console.log('Trabajador created successfully with ID:', newTrabajador.TrabajadorID);
      console.log('INERuta guardado en BD:', newTrabajador.INERuta);
      console.log('=== CREATE TRABAJADOR SUCCESS ===');
      
      return newTrabajador;
    } catch (error) {
      console.error('TrabajadorService.createTrabajador error:', error.message);
      throw new Error(`Error creating trabajador: ${error.message}`);
    }
  }

  async updateTrabajador(id, trabajador) {
    try {
      console.log('=== UPDATE TRABAJADOR START ===');
      console.log('ID:', id);
      console.log('Datos recibidos:', trabajador);
      console.log('INERuta recibida:', trabajador.INERuta);
      
      const pool = await poolPromise;
      const request = pool.request();
      
      request.input('TrabajadorID', sql.Int, id);

      // Campos actualizables - solo agregar si están definidos
      const campos = [];
      
      // Mapear cada campo con su tipo SQL
      const fieldMappings = [
        { name: 'NombreCompleto', type: sql.NVarChar(150) },
        { name: 'ApellidoPaterno', type: sql.NVarChar(60) },
        { name: 'ApellidoMaterno', type: sql.NVarChar(60) },
        { name: 'Puesto', type: sql.NVarChar(100) },
        { name: 'Oficio', type: sql.NVarChar(100) },
        { name: 'NSS', type: sql.NVarChar(20) },
        { name: 'ClaveEmpleado', type: sql.NVarChar(20) },
        { name: 'INE_Clave', type: sql.NVarChar(18) },
        { name: 'CURP', type: sql.NVarChar(18) },
        { name: 'RFC', type: sql.NVarChar(13) },
        { name: 'FechaNacimiento', type: sql.Date },
        { name: 'Telefono', type: sql.NVarChar(20) },
        { name: 'Correo', type: sql.NVarChar(100) },
        { name: 'Direccion', type: sql.NVarChar(250) },
        { name: 'Banco', type: sql.NVarChar(50) },
        { name: 'CuentaBancaria', type: sql.NVarChar(20) },
        { name: 'EsFacturador', type: sql.Bit },
        { name: 'FechaIngreso', type: sql.Date },
        { name: 'ObraActualID', type: sql.Int },
        { name: 'SueldoDiario', type: sql.Decimal(18, 2) },
        { name: 'INERuta', type: sql.NVarChar(sql.MAX) },
        { name: 'EstatusID', type: sql.Int }
      ];

      // Procesar cada campo
      fieldMappings.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(trabajador, field.name)) {
          const value = trabajador[field.name];
          console.log(`Procesando campo ${field.name}:`, value);
          // Incluir el campo si tiene un valor definido (incluso si es 0, false, o null)
          request.input(field.name, field.type, value);
          campos.push(`${field.name} = @${field.name}`);
        }
      });

      if (campos.length === 0) {
        throw new Error('No fields to update provided');
      }

      const query = `UPDATE Trabajador SET ${campos.join(', ')} WHERE TrabajadorID = @TrabajadorID`;
      
      console.log('Query final:', query);
      console.log('Campos a actualizar:', campos);
      
      const result = await request.query(query);
      
      console.log('Update result recordsAffected:', result.rowsAffected);
      
      if (result.rowsAffected[0] === 0) {
        throw new Error(`No se actualizó ningún registro. TrabajadorID ${id} podría no existir.`);
      }
      
      console.log('=== UPDATE TRABAJADOR SUCCESS ===');
      return { success: true };
    } catch (error) {
      console.error('TrabajadorService.updateTrabajador error:', error.message);
      console.error('Stack:', error.stack);
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

  async assignTrabajadorToObra(trabajadorId, obraId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('TrabajadorID', sql.Int, trabajadorId)
        .input('ObraID', sql.Int, obraId)
        .query(
          `INSERT INTO TrabajadorObra (TrabajadorID, ObraID)
           VALUES (@TrabajadorID, @ObraID);
           SELECT @@IDENTITY as TrabajadorObraID;`
        );
      return result.recordset[0];
    } catch (error) {
      console.error('TrabajadorService.assignTrabajadorToObra error:', error.message);
      throw new Error(`Error assigning trabajador to obra: ${error.message}`);
    }
  }

  async removeTrabajadorFromObra(trabajadorId, obraId) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('TrabajadorID', sql.Int, trabajadorId)
        .input('ObraID', sql.Int, obraId)
        .query(
          `UPDATE TrabajadorObra SET FechaFin = GETDATE() 
           WHERE TrabajadorID = @TrabajadorID AND ObraID = @ObraID`
        );
      return { success: true };
    } catch (error) {
      console.error('TrabajadorService.removeTrabajadorFromObra error:', error.message);
      throw new Error(`Error removing trabajador from obra: ${error.message}`);
    }
  }
}

module.exports = new TrabajadorService();

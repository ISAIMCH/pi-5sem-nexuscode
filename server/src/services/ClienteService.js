const { sql, poolPromise } = require('../config/database');

class ClienteService {
  async getAllClientes() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Cliente');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getClienteById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ClienteID', sql.Int, id)
        .query('SELECT * FROM Cliente WHERE ClienteID = @ClienteID');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async createCliente(cliente) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('Nombre', sql.NVarChar, cliente.Nombre)
        .input('RFC', sql.NVarChar, cliente.RFC || null)
        .input('Telefono', sql.NVarChar, cliente.Telefono || null)
        .input('Correo', sql.NVarChar, cliente.Correo || null)
        .query(
          `INSERT INTO Cliente (Nombre, RFC, Telefono, Correo) 
           OUTPUT INSERTED.ClienteID
           VALUES (@Nombre, @RFC, @Telefono, @Correo)`
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async updateCliente(id, cliente) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('ClienteID', sql.Int, id)
        .input('Nombre', sql.NVarChar, cliente.Nombre)
        .input('RFC', sql.NVarChar, cliente.RFC || null)
        .input('Telefono', sql.NVarChar, cliente.Telefono || null)
        .input('Correo', sql.NVarChar, cliente.Correo || null)
        .query(
          `UPDATE Cliente 
           SET Nombre = @Nombre, RFC = @RFC, Telefono = @Telefono, Correo = @Correo
           WHERE ClienteID = @ClienteID`
        );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async deleteCliente(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('ClienteID', sql.Int, id)
        .query('DELETE FROM Cliente WHERE ClienteID = @ClienteID');
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ClienteService();

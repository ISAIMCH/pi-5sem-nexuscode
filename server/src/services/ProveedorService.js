const { sql, poolPromise } = require('../config/database');

class ProveedorService {
  async getAllProveedores() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT p.*, ctp.Nombre as TipoNombre
         FROM Proveedor p
         LEFT JOIN Cat_TipoProveedor ctp ON p.TipoProveedorID = ctp.TipoProveedorID`
      );
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getProveedorById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ProveedorID', sql.Int, id)
        .query(
          `SELECT p.*, ctp.Nombre as TipoNombre
           FROM Proveedor p
           LEFT JOIN Cat_TipoProveedor ctp ON p.TipoProveedorID = ctp.TipoProveedorID
           WHERE p.ProveedorID = @ProveedorID`
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async createProveedor(proveedor) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('Nombre', sql.NVarChar, proveedor.Nombre)
        .input('RFC', sql.NVarChar, proveedor.RFC || null)
        .input('TipoProveedorID', sql.Int, proveedor.TipoProveedorID)
        .input('Telefono', sql.NVarChar, proveedor.Telefono || null)
        .input('Correo', sql.NVarChar, proveedor.Correo || null)
        .query(
          `INSERT INTO Proveedor (Nombre, RFC, TipoProveedorID, Telefono, Correo)
           OUTPUT INSERTED.ProveedorID
           VALUES (@Nombre, @RFC, @TipoProveedorID, @Telefono, @Correo)`
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async updateProveedor(id, proveedor) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('ProveedorID', sql.Int, id)
        .input('Nombre', sql.NVarChar, proveedor.Nombre)
        .input('RFC', sql.NVarChar, proveedor.RFC || null)
        .input('TipoProveedorID', sql.Int, proveedor.TipoProveedorID)
        .input('Telefono', sql.NVarChar, proveedor.Telefono || null)
        .input('Correo', sql.NVarChar, proveedor.Correo || null)
        .query(
          `UPDATE Proveedor
           SET Nombre = @Nombre, RFC = @RFC, TipoProveedorID = @TipoProveedorID, 
               Telefono = @Telefono, Correo = @Correo
           WHERE ProveedorID = @ProveedorID`
        );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async deleteProveedor(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('ProveedorID', sql.Int, id)
        .query('DELETE FROM Proveedor WHERE ProveedorID = @ProveedorID');
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProveedorService();

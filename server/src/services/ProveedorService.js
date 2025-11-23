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
      console.error('ProveedorService.getAllProveedores error:', error.message);
      throw new Error(`Error fetching proveedores: ${error.message}`);
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
      console.error('ProveedorService.getProveedorById error:', error.message);
      throw new Error(`Error fetching proveedor ${id}: ${error.message}`);
    }
  }

  async createProveedor(proveedor) {
    try {
      console.log('Creating proveedor with data:', proveedor);
      
      if (!proveedor.Nombre || !proveedor.TipoProveedorID) {
        throw new Error('Missing required fields: Nombre, TipoProveedorID');
      }

      const pool = await poolPromise;
      console.log('Pool obtained, executing INSERT query...');
      
      const result = await pool
        .request()
        .input('Nombre', sql.NVarChar(120), proveedor.Nombre)
        .input('RFC', sql.NVarChar(13), proveedor.RFC || null)
        .input('TipoProveedorID', sql.Int, proveedor.TipoProveedorID)
        .input('Telefono', sql.NVarChar(30), proveedor.Telefono || null)
        .input('Correo', sql.NVarChar(120), proveedor.Correo || null)
        .query(
          `INSERT INTO Proveedor (Nombre, RFC, TipoProveedorID, Telefono, Correo)
           VALUES (@Nombre, @RFC, @TipoProveedorID, @Telefono, @Correo);
           SELECT @@IDENTITY as ProveedorID;`
        );
      
      console.log('INSERT executed. Recordset:', result.recordset);
      
      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('INSERT query executed but no record returned');
      }
      
      console.log('Proveedor created successfully:', result.recordset[0]);
      return result.recordset[0];
    } catch (error) {
      console.error('ProveedorService.createProveedor error:', error.message);
      throw new Error(`Error creating proveedor: ${error.message}`);
    }
  }

  async updateProveedor(id, proveedor) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('ProveedorID', sql.Int, id)
        .input('Nombre', sql.NVarChar(120), proveedor.Nombre)
        .input('RFC', sql.NVarChar(13), proveedor.RFC || null)
        .input('TipoProveedorID', sql.Int, proveedor.TipoProveedorID)
        .input('Telefono', sql.NVarChar(30), proveedor.Telefono || null)
        .input('Correo', sql.NVarChar(120), proveedor.Correo || null)
        .query(
          `UPDATE Proveedor
           SET Nombre = @Nombre, RFC = @RFC, TipoProveedorID = @TipoProveedorID, 
               Telefono = @Telefono, Correo = @Correo
           WHERE ProveedorID = @ProveedorID`
        );
      return { success: true };
    } catch (error) {
      console.error('ProveedorService.updateProveedor error:', error.message);
      throw new Error(`Error updating proveedor: ${error.message}`);
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
      console.error('ProveedorService.deleteProveedor error:', error.message);
      throw new Error(`Error deleting proveedor: ${error.message}`);
    }
  }
}

module.exports = new ProveedorService();

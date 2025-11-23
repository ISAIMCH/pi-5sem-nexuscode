const { sql, poolPromise } = require('../config/database');

class CatalogoService {
  async getTiposProveedor() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Cat_TipoProveedor ORDER BY Nombre');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getTiposIngreso() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Cat_TipoIngreso ORDER BY Nombre');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getCategoriasGasto() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Cat_CategoriaGasto ORDER BY Nombre');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getTiposRetencion() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Cat_TipoRetencion ORDER BY Nombre');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getEstatuses() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Cat_Estatus ORDER BY Nombre');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getAllCatalogos() {
    try {
      return {
        tiposProveedor: await this.getTiposProveedor(),
        tiposIngreso: await this.getTiposIngreso(),
        categoriasGasto: await this.getCategoriasGasto(),
        tiposRetencion: await this.getTiposRetencion(),
        estatuses: await this.getEstatuses(),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CatalogoService();

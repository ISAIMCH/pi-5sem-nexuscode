const { sql, poolPromise } = require('../config/database');

class ObraService {
  async getAllObras() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT o.*, c.Nombre as ClienteNombre, ce.Nombre as EstatusNombre
         FROM Obra o
         LEFT JOIN Cliente c ON o.ClienteID = c.ClienteID
         LEFT JOIN Cat_Estatus ce ON o.EstatusID = ce.EstatusID
         ORDER BY o.ObraID DESC`
      );
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  async getObraById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ObraID', sql.Int, id)
        .query(
          `SELECT o.*, c.Nombre as ClienteNombre, ce.Nombre as EstatusNombre
           FROM Obra o
           LEFT JOIN Cliente c ON o.ClienteID = c.ClienteID
           LEFT JOIN Cat_Estatus ce ON o.EstatusID = ce.EstatusID
           WHERE o.ObraID = @ObraID`
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async createObra(obra) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('ClienteID', sql.Int, obra.ClienteID)
        .input('Nombre', sql.NVarChar, obra.Nombre)
        .input('Ubicacion', sql.NVarChar, obra.Ubicacion || null)
        .input('FechaInicio', sql.Date, obra.FechaInicio || null)
        .input('FechaFin', sql.Date, obra.FechaFin || null)
        .input('EstatusID', sql.Int, obra.EstatusID || 1)
        .input('CentroCostos', sql.NVarChar, obra.CentroCostos || null)
        .input('MontoContrato', sql.Decimal(18, 2), obra.MontoContrato || 0)
        .input('Descripcion', sql.NVarChar, obra.Descripcion || null)
        .input('NumeroContrato', sql.NVarChar, obra.NumeroContrato || null)
        .input('Responsable', sql.NVarChar, obra.Responsable || null)
        .query(
          `INSERT INTO Obra (ClienteID, Nombre, Ubicacion, FechaInicio, FechaFin, EstatusID, CentroCostos, MontoContrato, Descripcion, NumeroContrato, Responsable)
           VALUES (@ClienteID, @Nombre, @Ubicacion, @FechaInicio, @FechaFin, @EstatusID, @CentroCostos, @MontoContrato, @Descripcion, @NumeroContrato, @Responsable);
           SELECT @@IDENTITY as ObraID;`
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  async updateObra(id, obra) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('ObraID', sql.Int, id)
        .input('ClienteID', sql.Int, obra.ClienteID)
        .input('Nombre', sql.NVarChar, obra.Nombre)
        .input('Ubicacion', sql.NVarChar, obra.Ubicacion || null)
        .input('FechaInicio', sql.Date, obra.FechaInicio || null)
        .input('FechaFin', sql.Date, obra.FechaFin || null)
        .input('EstatusID', sql.Int, obra.EstatusID)
        .input('CentroCostos', sql.NVarChar, obra.CentroCostos || null)
        .input('MontoContrato', sql.Decimal(18, 2), obra.MontoContrato)
        .input('Descripcion', sql.NVarChar, obra.Descripcion || null)
        .input('NumeroContrato', sql.NVarChar, obra.NumeroContrato || null)
        .input('Responsable', sql.NVarChar, obra.Responsable || null)
        .query(
          `UPDATE Obra
           SET ClienteID = @ClienteID, Nombre = @Nombre, Ubicacion = @Ubicacion,
               FechaInicio = @FechaInicio, FechaFin = @FechaFin, EstatusID = @EstatusID,
               CentroCostos = @CentroCostos, MontoContrato = @MontoContrato,
               Descripcion = @Descripcion, NumeroContrato = @NumeroContrato,
               Responsable = @Responsable
           WHERE ObraID = @ObraID`
        );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async deleteObra(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input('ObraID', sql.Int, id)
        .query('DELETE FROM Obra WHERE ObraID = @ObraID');
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async getObraResumen(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input('ObraID', sql.Int, id).query(
        `SELECT 
          o.ObraID,
          o.Nombre,
          o.MontoContrato,
          COALESCE((SELECT SUM(Monto) FROM Ingreso WHERE ObraID = @ObraID), 0) as TotalIngresos,
          COALESCE((SELECT SUM(TotalCompra) FROM CompraMaterial WHERE ObraID = @ObraID), 0) as TotalCompras,
          COALESCE((SELECT SUM(CostoTotal) FROM RentaMaquinaria WHERE ObraID = @ObraID), 0) as TotalRenta,
          COALESCE((SELECT SUM(Monto) FROM GastoGeneral WHERE ObraID = @ObraID), 0) as TotalGastos,
          COALESCE((SELECT SUM(MontoPagado) FROM PagoNomina WHERE ObraID = @ObraID), 0) as TotalNomina
         FROM Obra o
         WHERE o.ObraID = @ObraID`
      );
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ObraService();

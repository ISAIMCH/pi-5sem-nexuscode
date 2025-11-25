const { connect } = require('../config/database');
const sql = require('mssql');

class NominaService {
  // Obtener todos los pagos de nómina de una obra
  static async getPagosByObra(obraID) {
    try {
      const pool = await connect();
      const result = await pool
        .request()
        .input('ObraID', sql.Int, obraID)
        .query(`
          SELECT 
            pn.NominaID,
            pn.ObraID,
            pn.TrabajadorID,
            pn.FechaPago,
            pn.MontoPagado,
            pn.DiasPagados,
            pn.Observaciones,
            pn.FolioNomina,
            pn.FechaInicio,
            pn.FechaFin,
            t.NombreCompleto,
            t.Puesto,
            t.SueldoDiario
          FROM PagoNomina pn
          JOIN Trabajador t ON pn.TrabajadorID = t.TrabajadorID
          WHERE pn.ObraID = @ObraID
          ORDER BY pn.FechaPago DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in getNomina:', error);
      throw error;
    }
  }

  // Crear un nuevo pago de nómina
  static async createPago(pagoData) {
    try {
      const pool = await connect();
      
      const result = await pool
        .request()
        .input('ObraID', sql.Int, pagoData.ObraID)
        .input('TrabajadorID', sql.Int, pagoData.TrabajadorID)
        .input('FechaPago', sql.Date, pagoData.FechaPago)
        .input('MontoPagado', sql.Decimal(18, 2), pagoData.MontoPagado)
        .input('DiasPagados', sql.Decimal(4, 1), pagoData.DiasPagados || 0)
        .input('Observaciones', sql.NVarChar(250), pagoData.Observaciones || null)
        .query(`
          INSERT INTO PagoNomina 
          (ObraID, TrabajadorID, FechaPago, MontoPagado, DiasPagados, Observaciones, FechaRegistro)
          VALUES 
          (@ObraID, @TrabajadorID, @FechaPago, @MontoPagado, @DiasPagados, @Observaciones, GETDATE())
          
          SELECT SCOPE_IDENTITY() as NominaID
        `);
      
      return { success: true, NominaID: result.recordset[0].NominaID };
    } catch (error) {
      console.error('Error creating pago nomina:', error);
      throw error;
    }
  }

  // Crear múltiples pagos de nómina (lote semanal)
  static async createLoteNomina(pagosList) {
    try {
      const pool = await connect();
      const transaction = new sql.Transaction(pool);
      
      await transaction.begin();
      
      const results = [];
      
      for (const pago of pagosList) {
        const result = await transaction
          .request()
          .input('ObraID', sql.Int, pago.ObraID)
          .input('TrabajadorID', sql.Int, pago.TrabajadorID)
          .input('FechaPago', sql.Date, pago.FechaPago)
          .input('MontoPagado', sql.Decimal(18, 2), pago.MontoPagado)
          .input('DiasPagados', sql.Decimal(4, 1), pago.DiasPagados || 0)
          .input('Observaciones', sql.NVarChar(250), pago.Observaciones || null)
          .query(`
            INSERT INTO PagoNomina 
            (ObraID, TrabajadorID, FechaPago, MontoPagado, DiasPagados, Observaciones, FechaRegistro)
            VALUES 
            (@ObraID, @TrabajadorID, @FechaPago, @MontoPagado, @DiasPagados, @Observaciones, GETDATE())
            
            SELECT SCOPE_IDENTITY() as NominaID
          `);
        
        results.push(result.recordset[0].NominaID);
      }
      
      await transaction.commit();
      
      return { success: true, count: results.length, nominasCreadas: results };
    } catch (error) {
      console.error('Error creating lote nomina:', error);
      throw error;
    }
  }

  // Obtener trabajadores asignados a una obra
  static async getTrabajadoresByObra(obraID) {
    try {
      const pool = await connect();
      const result = await pool
        .request()
        .input('ObraID', sql.Int, obraID)
        .query(`
          SELECT 
            TrabajadorID,
            NombreCompleto,
            Puesto,
            Oficio,
            SueldoDiario,
            ObraActualID,
            EstatusID,
            NSS,
            RFC
          FROM Trabajador
          WHERE ObraActualID = @ObraID
          AND EstatusID IN (1, 3)
          ORDER BY NombreCompleto
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error getting trabajadores by obra:', error);
      throw error;
    }
  }

  // Eliminar un pago de nómina
  static async deletePago(nominaID) {
    try {
      const pool = await connect();
      const result = await pool
        .request()
        .input('NominaID', sql.Int, nominaID)
        .query('DELETE FROM PagoNomina WHERE NominaID = @NominaID');
      
      return { success: true, affected: result.rowsAffected[0] };
    } catch (error) {
      console.error('Error deleting pago nomina:', error);
      throw error;
    }
  }

  // Actualizar un pago de nómina
  static async updatePago(nominaID, pagoData) {
    try {
      const pool = await connect();
      const result = await pool
        .request()
        .input('NominaID', sql.Int, nominaID)
        .input('MontoPagado', sql.Decimal(18, 2), pagoData.MontoPagado)
        .input('DiasPagados', sql.Decimal(4, 1), pagoData.DiasPagados || 0)
        .input('Observaciones', sql.NVarChar(250), pagoData.Observaciones || null)
        .query(`
          UPDATE PagoNomina
          SET MontoPagado = @MontoPagado,
              DiasPagados = @DiasPagados,
              Observaciones = @Observaciones
          WHERE NominaID = @NominaID
        `);
      
      return { success: true, affected: result.rowsAffected[0] };
    } catch (error) {
      console.error('Error updating pago nomina:', error);
      throw error;
    }
  }
}

module.exports = NominaService;

const { sql, poolPromise } = require('../config/database');

exports.getAllNomina = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT pn.NominaID, pn.ObraID, pn.TrabajadorID, pn.FechaPago, pn.MontoPagado,
             pn.XMLRuta, pn.FacturaRuta, pn.PeriodoInicio, pn.PeriodoFin,
             pn.EstatusPago, pn.Concepto, pn.Observaciones,
             t.NombreCompleto as TrabajadorNombre, t.Puesto
      FROM PagoNomina pn
      LEFT JOIN Trabajador t ON pn.TrabajadorID = t.TrabajadorID
      ORDER BY pn.FechaPago DESC
    `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getAllNomina:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getNominaByObra = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { obraId } = req.params;
    const query = `
      SELECT pn.NominaID, pn.ObraID, pn.TrabajadorID, pn.FechaPago, pn.MontoPagado,
             pn.XMLRuta, pn.FacturaRuta, pn.PeriodoInicio, pn.PeriodoFin,
             pn.EstatusPago, pn.Concepto, pn.Observaciones,
             t.NombreCompleto as TrabajadorNombre, t.Puesto
      FROM PagoNomina pn
      LEFT JOIN Trabajador t ON pn.TrabajadorID = t.TrabajadorID
      WHERE pn.ObraID = @obraId
      ORDER BY pn.FechaPago DESC
    `;
    const result = await pool.request()
      .input('obraId', sql.Int, obraId)
      .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getNominaByObra:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createNomina = async (req, res) => {
  try {
    console.log('=== CREATE NOMINA - INICIO ===');
    console.log('req.body completo:', JSON.stringify(req.body, null, 2));
    
    const { ObraID, TrabajadorID, FechaPago, PeriodoInicio, PeriodoFin, MontoPagado, EstatusPago, XMLRuta, FacturaRuta, Concepto, Observaciones } = req.body;
    const pool = await poolPromise;
    
    console.log('=== DESTRUCTURED VALUES ===');
    console.log('ObraID:', ObraID, typeof ObraID);
    console.log('TrabajadorID:', TrabajadorID, typeof TrabajadorID);
    console.log('FechaPago:', FechaPago, typeof FechaPago);
    console.log('XMLRuta:', XMLRuta, typeof XMLRuta);
    console.log('FacturaRuta:', FacturaRuta, typeof FacturaRuta);
    console.log('Concepto:', Concepto, typeof Concepto);
    
    const query = `
      INSERT INTO PagoNomina (ObraID, TrabajadorID, FechaPago, PeriodoInicio, PeriodoFin, MontoPagado, EstatusPago, XMLRuta, FacturaRuta, Concepto, Observaciones)
      VALUES (@obraId, @trabajadorId, @fechaPago, @periodoInicio, @periodoFin, @montoPagado, @estatusPago, @xmlRuta, @facturaRuta, @concepto, @observaciones);
      SELECT @@IDENTITY as NominaID;
    `;
    
    console.log('=== EJECUTANDO QUERY ===');
    console.log('Query SQL:', query);
    
    const request = pool.request()
      .input('obraId', sql.Int, ObraID)
      .input('trabajadorId', sql.Int, TrabajadorID)
      .input('fechaPago', sql.DateTime, FechaPago)
      .input('periodoInicio', sql.Date, PeriodoInicio || null)
      .input('periodoFin', sql.Date, PeriodoFin || null)
      .input('montoPagado', sql.Decimal(18, 2), MontoPagado)
      .input('estatusPago', sql.NVarChar(20), EstatusPago || 'Pendiente')
      .input('xmlRuta', sql.NVarChar(sql.MAX), XMLRuta || null)
      .input('facturaRuta', sql.NVarChar(sql.MAX), FacturaRuta || null)
      .input('concepto', sql.NVarChar(100), Concepto || null)
      .input('observaciones', sql.NVarChar(250), Observaciones || null);
    
    console.log('=== PARAMETROS SQL ===');
    console.log('xmlRuta param (should be):', XMLRuta || null);
    console.log('facturaRuta param (should be):', FacturaRuta || null);
    
    console.log('=== EJECUTANDO QUERY CON PARAMETROS ===');
    const result = await request.query(query);
    
    console.log('=== QUERY EJECUTADO EXITOSAMENTE ===');
    console.log('Recordset:', JSON.stringify(result.recordset));
    console.log('Nómina creada exitosamente con ID:', result.recordset[0].NominaID);
    console.log('=== VALORES QUE SE INSERTARON ===');
    console.log('XMLRuta:', XMLRuta);
    console.log('FacturaRuta:', FacturaRuta);
    console.log('Concepto:', Concepto);
    
    res.status(201).json({ 
      NominaID: result.recordset[0].NominaID, 
      ObraID, 
      TrabajadorID, 
      FechaPago, 
      MontoPagado,
      XMLRuta,
      FacturaRuta,
      Concepto
    });
  } catch (error) {
    console.error('=== ERROR EN CREATE NOMINA ===');
    console.error('Mensaje de error:', error.message);
    console.error('Codigo de error:', error.code);
    console.error('Numero de error SQL:', error.number);
    console.error('Stack completo:', error.stack);
    res.status(500).json({ error: error.message, code: error.code, number: error.number });
  }
};

exports.updateNomina = async (req, res) => {
  try {
    const { ObraID, TrabajadorID, FechaPago, PeriodoInicio, PeriodoFin, MontoPagado, EstatusPago, XMLRuta, FacturaRuta, Concepto, Observaciones } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    
    console.log('=== UPDATE NOMINA ===');
    console.log('ID:', id);
    console.log('Datos recibidos:', { ObraID, TrabajadorID, XMLRuta, FacturaRuta });
    
    const query = `
      UPDATE PagoNomina
      SET ObraID = @obraId, TrabajadorID = @trabajadorId, FechaPago = @fechaPago, 
          PeriodoInicio = @periodoInicio, PeriodoFin = @periodoFin,
          MontoPagado = @montoPagado, EstatusPago = @estatusPago,
          XMLRuta = @xmlRuta, FacturaRuta = @facturaRuta,
          Concepto = @concepto, Observaciones = @observaciones
      WHERE NominaID = @id
    `;
    await pool.request()
      .input('id', sql.Int, id)
      .input('obraId', sql.Int, ObraID)
      .input('trabajadorId', sql.Int, TrabajadorID)
      .input('fechaPago', sql.DateTime, FechaPago)
      .input('periodoInicio', sql.Date, PeriodoInicio || null)
      .input('periodoFin', sql.Date, PeriodoFin || null)
      .input('montoPagado', sql.Decimal(18, 2), MontoPagado)
      .input('estatusPago', sql.NVarChar(20), EstatusPago || 'Pendiente')
      .input('xmlRuta', sql.NVarChar(sql.MAX), XMLRuta || null)
      .input('facturaRuta', sql.NVarChar(sql.MAX), FacturaRuta || null)
      .input('concepto', sql.NVarChar(100), Concepto || null)
      .input('observaciones', sql.NVarChar(250), Observaciones || null)
      .query(query);
    
    console.log('Nómina actualizada exitosamente');
    console.log('XMLRuta actualizada:', XMLRuta);
    console.log('FacturaRuta actualizada:', FacturaRuta);
    
    res.json({ success: true, NominaID: id });
  } catch (error) {
    console.error('Error en updateNomina:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNomina = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const query = 'DELETE FROM PagoNomina WHERE NominaID = @id';
    await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    res.json({ success: true, message: 'Pago eliminado' });
  } catch (error) {
    console.error('Error en deleteNomina:', error);
    res.status(500).json({ error: error.message });
  }
};

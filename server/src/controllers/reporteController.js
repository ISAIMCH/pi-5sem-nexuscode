const { getConnection } = require('../config/database');

// ✅ Obtener todos los reportes
const getAll = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query('SELECT * FROM ReporteAvance ORDER BY FechaReporte DESC');

    res.json(result.recordset || []);
  } catch (error) {
    console.error('Error fetching all reportes:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Obtener reportes de una obra
const getByObra = async (req, res) => {
  try {
    const { obraId } = req.params;

    if (!obraId) {
      return res.status(400).json({ error: 'obraId es requerido' });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('ObraID', obraId)
      .query('SELECT * FROM ReporteAvance WHERE ObraID = @ObraID ORDER BY FechaReporte DESC');

    res.json(result.recordset || []);
  } catch (error) {
    console.error('Error fetching reportes:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Crear nuevo reporte de avance
const create = async (req, res) => {
  try {
    const { ObraID, FechaReporte, PorcentajeFisico, Observaciones } = req.body;

    // Validaciones
    if (!ObraID || !FechaReporte || PorcentajeFisico === undefined || PorcentajeFisico === null) {
      return res.status(400).json({
        error: 'ObraID, FechaReporte y PorcentajeFisico son requeridos'
      });
    }

    if (PorcentajeFisico < 0 || PorcentajeFisico > 100) {
      return res.status(400).json({
        error: 'PorcentajeFisico debe estar entre 0 y 100'
      });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('ObraID', ObraID)
      .input('FechaReporte', new Date(FechaReporte))
      .input('PorcentajeFisico', PorcentajeFisico)
      .input('Observaciones', Observaciones || null)
      .query(`
        INSERT INTO ReporteAvance (ObraID, FechaReporte, PorcentajeFisico, Observaciones)
        VALUES (@ObraID, @FechaReporte, @PorcentajeFisico, @Observaciones);
        SELECT SCOPE_IDENTITY() as AvanceID;
      `);

    const avanceId = result.recordset[0]?.AvanceID;
    res.status(201).json({
      message: 'Reporte creado exitosamente',
      AvanceID: avanceId,
      data: {
        AvanceID: avanceId,
        ObraID,
        FechaReporte,
        PorcentajeFisico,
        Observaciones
      }
    });
  } catch (error) {
    console.error('Error creating reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Actualizar reporte de avance
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { FechaReporte, PorcentajeFisico, Observaciones } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'AvanceID es requerido' });
    }

    // Validaciones
    if (PorcentajeFisico !== undefined && (PorcentajeFisico < 0 || PorcentajeFisico > 100)) {
      return res.status(400).json({
        error: 'PorcentajeFisico debe estar entre 0 y 100'
      });
    }

    const pool = await getConnection();
    
    // Verificar que el reporte existe
    const checkResult = await pool
      .request()
      .input('AvanceID', id)
      .query('SELECT AvanceID FROM ReporteAvance WHERE AvanceID = @AvanceID');

    if (!checkResult.recordset || checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Actualizar reporte
    await pool
      .request()
      .input('AvanceID', id)
      .input('FechaReporte', FechaReporte ? new Date(FechaReporte) : null)
      .input('PorcentajeFisico', PorcentajeFisico)
      .input('Observaciones', Observaciones || null)
      .query(`
        UPDATE ReporteAvance
        SET 
          FechaReporte = COALESCE(@FechaReporte, FechaReporte),
          PorcentajeFisico = COALESCE(@PorcentajeFisico, PorcentajeFisico),
          Observaciones = @Observaciones
        WHERE AvanceID = @AvanceID
      `);

    res.json({ message: 'Reporte actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Eliminar reporte de avance
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'AvanceID es requerido' });
    }

    const pool = await getConnection();

    // Verificar que el reporte existe
    const checkResult = await pool
      .request()
      .input('AvanceID', id)
      .query('SELECT AvanceID FROM ReporteAvance WHERE AvanceID = @AvanceID');

    if (!checkResult.recordset || checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Eliminar reporte
    await pool
      .request()
      .input('AvanceID', id)
      .query('DELETE FROM ReporteAvance WHERE AvanceID = @AvanceID');

    res.json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Obtener reporte por ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'AvanceID es requerido' });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('AvanceID', id)
      .query('SELECT * FROM ReporteAvance WHERE AvanceID = @AvanceID');

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getByObra,
  create,
  update,
  deleteReport,
  getById
};

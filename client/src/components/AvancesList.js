import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/AvancesList.css';

const AvancesList = () => {
  // Estado principal
  const [obras, setObras] = useState([]);
  const [selectedObra, setSelectedObra] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado del modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    FechaReporte: new Date().toISOString().split('T')[0],
    PorcentajeFisico: 0,
    Observaciones: ''
  });

  // Estado para evidencia
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  // 📊 Cargar obras disponibles
  useEffect(() => {
    loadObras();
  }, []);

  const loadObras = async () => {
    try {
      setLoading(true);
      const response = await api.obrasAPI.getAll();
      
      if (Array.isArray(response)) {
        setObras(response);
        if (response.length > 0) {
          setSelectedObra(response[0].ObraID);
        }
      } else {
        setError('No se pudieron cargar las obras');
        setObras([]);
      }
    } catch (err) {
      console.error('Error loading obras:', err);
      setError('Error al cargar obras');
      setObras([]);
    } finally {
      setLoading(false);
    }
  };

  // 📋 Cargar reportes de la obra seleccionada
  useEffect(() => {
    if (selectedObra) {
      loadReportes();
    }
  }, [selectedObra]);

  const loadReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.reportesAPI.getByObra(selectedObra);
      
      if (Array.isArray(response)) {
        setReportes(response);
      } else {
        setError('Error al cargar los reportes');
        setReportes([]);
      }
    } catch (err) {
      console.error('Error loading reportes:', err);
      setError('Error al cargar los reportes');
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  // 📊 Calcular métricas de la obra seleccionada
  const porcentajePromedio = Array.isArray(reportes) && reportes.length > 0
    ? (reportes.reduce((sum, r) => sum + (parseFloat(r.PorcentajeFisico) || 0), 0) / reportes.length).toFixed(1)
    : 0;

  const ultimoReporte = Array.isArray(reportes) && reportes.length > 0
    ? reportes[0]
    : null;

  // ✏️ Manejo del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'PorcentajeFisico' ? (value ? parseFloat(value) : 0) : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles(files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!selectedObra) {
        setError('Por favor selecciona una obra');
        return;
      }

      if (formData.PorcentajeFisico < 0 || formData.PorcentajeFisico > 100) {
        setError('El porcentaje debe estar entre 0 y 100');
        return;
      }

      const dataToSend = {
        ObraID: selectedObra,
        FechaReporte: formData.FechaReporte,
        PorcentajeFisico: formData.PorcentajeFisico,
        Observaciones: formData.Observaciones || null
      };

      if (editingId) {
        // Actualizar reporte existente
        await api.reportesAPI.update(editingId, dataToSend);
        setEditingId(null);
      } else {
        // Crear nuevo reporte
        await api.reportesAPI.create(dataToSend);
      }

      // Limpiar estado y recargar
      resetForm();
      setShowModal(false);
      await loadReportes();
    } catch (err) {
      console.error('Error al guardar reporte:', err);
      setError('Error al guardar el reporte');
    }
  };

  const resetForm = () => {
    setFormData({
      FechaReporte: new Date().toISOString().split('T')[0],
      PorcentajeFisico: 0,
      Observaciones: ''
    });
    setEvidenceFiles([]);
    setEditingId(null);
  };

  // 🗑️ Eliminar reporte
  const handleDeleteReport = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      try {
        await api.reportesAPI.delete(id);
        await loadReportes();
      } catch (err) {
        console.error('Error al eliminar reporte:', err);
        setError('Error al eliminar el reporte');
      }
    }
  };

  // ✏️ Editar reporte
  const handleEditReport = (reporte) => {
    setFormData({
      FechaReporte: reporte.FechaReporte,
      PorcentajeFisico: reporte.PorcentajeFisico,
      Observaciones: reporte.Observaciones || ''
    });
    setEditingId(reporte.AvanceID);
    setShowModal(true);
  };

  // 📸 Abrir modal de evidencia
  const handleViewEvidence = (reporte) => {
    setSelectedEvidence(reporte);
    setShowEvidenceModal(true);
  };

  if (loading && obras.length === 0) {
    return <div className="avances-container"><p className="loading">Cargando...</p></div>;
  }

  return (
    <div className="avances-container">
      {/* 🎯 Selector de obra */}
      <div className="obra-selector-section">
        <label htmlFor="obra-select" className="selector-label">Selecciona una obra:</label>
        <select
          id="obra-select"
          value={selectedObra || ''}
          onChange={(e) => setSelectedObra(parseInt(e.target.value))}
          className="obra-select"
        >
          <option value="">-- Selecciona una obra --</option>
          {Array.isArray(obras) && obras.map(obra => (
            <option key={obra.ObraID} value={obra.ObraID}>
              {obra.Nombre} - {obra.Ubicacion}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {selectedObra && (
        <>
          {/* 📊 Sección de métricas */}
          <div className="metrics-section">
            <div className="metric-card">
              <div className="metric-label">Último Reporte</div>
              <div className="metric-value">{ultimoReporte ? ultimoReporte.PorcentajeFisico + '%' : 'N/A'}</div>
              <div className="metric-date">{ultimoReporte ? new Date(ultimoReporte.FechaReporte).toLocaleDateString() : '-'}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Promedio Avance</div>
              <div className="metric-value">{porcentajePromedio}%</div>
              <div className="metric-date">De {reportes.length} reportes</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Reportes</div>
              <div className="metric-value">{reportes.length}</div>
              <div className="metric-date">Registrados</div>
            </div>
          </div>

          {/* 📈 Barra de progreso dinámica */}
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Progreso Actual</span>
              <span className="progress-percentage">{ultimoReporte ? ultimoReporte.PorcentajeFisico + '%' : '0%'}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${ultimoReporte ? ultimoReporte.PorcentajeFisico : 0}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div className="progress-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 📋 Reportes Semanales */}
          <div className="reportes-section">
            <div className="section-header">
              <h2>Reportes Semanales</h2>
              <button
                className="btn-agregar-reporte"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                + Agregar Reporte
              </button>
            </div>

            {reportes.length === 0 ? (
              <div className="no-data-message">No hay reportes registrados. Crea el primer reporte.</div>
            ) : (
              <div className="reportes-grid">
                {reportes.map(reporte => (
                  <div key={reporte.AvanceID} className="reporte-card">
                    <div className="reporte-header">
                      <div className="reporte-percentage">
                        <span className="percentage-value">{reporte.PorcentajeFisico}%</span>
                        <span className="percentage-label">Avance</span>
                      </div>
                      <div className="reporte-date">
                        {new Date(reporte.FechaReporte).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>

                    <div className="reporte-body">
                      <p className="reporte-observaciones">
                        {reporte.Observaciones || 'Sin observaciones'}
                      </p>
                    </div>

                    <div className="reporte-footer">
                      <div className="reporte-actions">
                        <button
                          className="btn-evidencia"
                          onClick={() => handleViewEvidence(reporte)}
                        >
                          📸 Ver Evidencia
                        </button>
                      </div>
                      <div className="reporte-controls">
                        <button
                          className="btn-editar"
                          onClick={() => handleEditReport(reporte)}
                          title="Editar reporte"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-eliminar"
                          onClick={() => handleDeleteReport(reporte.AvanceID)}
                          title="Eliminar reporte"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🔲 Modal para agregar/editar reporte */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingId ? 'Editar Reporte' : 'Nuevo Reporte de Avance'}</h2>
                  <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="reporte-form">
                  <div className="form-group">
                    <label htmlFor="fecha">Fecha del Reporte *</label>
                    <input
                      type="date"
                      id="fecha"
                      name="FechaReporte"
                      value={formData.FechaReporte}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="porcentaje">Porcentaje de Avance (0-100) *</label>
                    <div className="porcentaje-input-wrapper">
                      <input
                        type="number"
                        id="porcentaje"
                        name="PorcentajeFisico"
                        value={formData.PorcentajeFisico}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        required
                        className="form-input"
                      />
                      <span className="porcentaje-symbol">%</span>
                    </div>
                    <div className="progress-bar-mini" style={{ width: formData.PorcentajeFisico + '%' }} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="observaciones">Observaciones</label>
                    <textarea
                      id="observaciones"
                      name="Observaciones"
                      value={formData.Observaciones}
                      onChange={handleInputChange}
                      placeholder="Describe el progreso, cambios, problemas, etc."
                      className="form-textarea"
                      rows="5"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-guardar">
                      {editingId ? 'Actualizar' : 'Crear'} Reporte
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 📸 Modal de evidencia */}
          {showEvidenceModal && (
            <div className="modal-overlay" onClick={() => setShowEvidenceModal(false)}>
              <div className="modal-content modal-evidence" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Evidencia del Reporte - {selectedEvidence?.PorcentajeFisico}%</h2>
                  <button className="btn-close" onClick={() => setShowEvidenceModal(false)}>×</button>
                </div>

                <div className="evidence-content">
                  <p className="evidence-date">
                    Fecha: {new Date(selectedEvidence?.FechaReporte).toLocaleDateString()}
                  </p>

                  <div className="evidence-gallery">
                    <div className="no-evidence-message">
                      📸 No hay evidencia cargada aún.
                      <p className="small-text">Las imágenes se mostrarán aquí una vez que se implemente el sistema de almacenamiento.</p>
                    </div>
                  </div>

                  <div className="evidence-upload">
                    <label className="upload-label">Subir Evidencia:</label>
                    <div className="upload-area">
                      <input
                        type="file"
                        id="evidence-input"
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        className="evidence-input"
                      />
                      <label htmlFor="evidence-input" className="upload-button">
                        + Seleccionar Imágenes
                      </label>
                    </div>

                    {evidenceFiles.length > 0 && (
                      <div className="preview-gallery">
                        {evidenceFiles.map((file, idx) => (
                          <div key={idx} className="preview-item">
                            <img src={file.preview} alt={`Preview ${idx}`} />
                            <span className="file-name">{file.file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="evidence-actions">
                    <button
                      className="btn-cancelar"
                      onClick={() => setShowEvidenceModal(false)}
                    >
                      Cerrar
                    </button>
                    <button
                      className="btn-guardar"
                      disabled={evidenceFiles.length === 0}
                    >
                      Guardar Evidencia ({evidenceFiles.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AvancesList;

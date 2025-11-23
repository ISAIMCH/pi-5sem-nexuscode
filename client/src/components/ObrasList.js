import React, { useState, useEffect } from 'react';
import { obrasAPI } from '../services/api';
import ObraForm from './ObraForm';
import '../styles/ObrasList.css';

const ObrasList = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedObra, setSelectedObra] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);

  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      setLoading(true);
      const data = await obrasAPI.getAll();
      setObras(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar las obras: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setSelectedObra(null);
    setShowForm(true);
  };

  const handleViewProject = (obra) => {
    setExpandedDetails(expandedDetails === obra.ObraID ? null : obra.ObraID);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedObra(null);
  };

  const handleFormSaved = () => {
    fetchObras();
    handleFormClose();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX');
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Activa': 'status-active',
      'Cerrada': 'status-closed',
      'Recuperada': 'status-recovered',
      'Baja': 'status-low',
    };
    return statusMap[status] || 'status-default';
  };

  if (loading) return <div className="loading">⏳ Cargando obras...</div>;
  if (error) return <div className="error">❌ {error}</div>;

  return (
    <div className="obras-container">
      {/* Header */}
      <div className="obras-header">
        <div className="header-title">
          <h1>📋 Gestión de Proyectos</h1>
          <p className="subtitle">Visualiza, agrega y administra todos tus proyectos de construcción</p>
        </div>
        <button className="btn-add-project" onClick={handleAddProject}>
          ➕ Agregar un Nuevo Proyecto
        </button>
      </div>

      {/* Lista de Obras */}
      <div className="obras-content">
        {obras.length === 0 ? (
          <div className="no-obras">
            <div className="no-obras-icon">🏗️</div>
            <h2>No hay proyectos registrados</h2>
            <p>Haz clic en el botón superior para crear tu primer proyecto</p>
          </div>
        ) : (
          <div className="obras-list">
            {/* Tabla de Obras */}
            <div className="tabla-wrapper">
              <table className="obras-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre del Proyecto</th>
                    <th>Cliente</th>
                    <th>Ubicación</th>
                    <th>Monto Contrato</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {obras.map((obra) => (
                    <React.Fragment key={obra.ObraID}>
                      <tr className={expandedDetails === obra.ObraID ? 'expanded' : ''}>
                        <td className="col-id">{obra.ObraID}</td>
                        <td className="col-nombre">
                          <strong>{obra.Nombre}</strong>
                        </td>
                        <td className="col-cliente">{obra.ClienteNombre || '-'}</td>
                        <td className="col-ubicacion">{obra.Ubicacion || '-'}</td>
                        <td className="col-monto">{formatCurrency(obra.MontoContrato)}</td>
                        <td className="col-estatus">
                          <span className={`status-badge ${getStatusBadgeClass(obra.EstatusNombre)}`}>
                            {obra.EstatusNombre || '-'}
                          </span>
                        </td>
                        <td className="col-acciones">
                          <button
                            className="btn-action btn-view"
                            onClick={() => handleViewProject(obra)}
                            title="Ver detalles"
                          >
                            👁️ Ver
                          </button>
                        </td>
                      </tr>

                      {/* Fila de Detalles Expandibles */}
                      {expandedDetails === obra.ObraID && (
                        <tr className="details-row">
                          <td colSpan="7">
                            <div className="detail-content">
                              <div className="detail-grid">
                                {/* Columna 1: Información General */}
                                <div className="detail-section">
                                  <h3>📋 Información General</h3>
                                  <div className="detail-item">
                                    <label>Nombre del Proyecto:</label>
                                    <p>{obra.Nombre}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Cliente:</label>
                                    <p>{obra.ClienteNombre || '-'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Ubicación:</label>
                                    <p>{obra.Ubicacion || '-'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Estado del Proyecto:</label>
                                    <p>
                                      <span className={`status-badge ${getStatusBadgeClass(obra.EstatusNombre)}`}>
                                        {obra.EstatusNombre || '-'}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {/* Columna 2: Fechas y Presupuesto */}
                                <div className="detail-section">
                                  <h3>📅 Cronograma y Presupuesto</h3>
                                  <div className="detail-item">
                                    <label>Fecha de Inicio:</label>
                                    <p>{formatDate(obra.FechaInicio)}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Fecha Estimada de Finalización:</label>
                                    <p>{formatDate(obra.FechaFin)}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Monto del Contrato:</label>
                                    <p className="monto-value">{formatCurrency(obra.MontoContrato)}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Centro de Costos:</label>
                                    <p>{obra.CentroCostos || '-'}</p>
                                  </div>
                                </div>

                                {/* Columna 3: Información Adicional */}
                                <div className="detail-section">
                                  <h3>ℹ️ Información Adicional</h3>
                                  <div className="detail-item">
                                    <label>Descripción:</label>
                                    <p>{obra.Descripcion || '-'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Número de Contrato:</label>
                                    <p>{obra.NumeroContrato || '-'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Responsable del Proyecto:</label>
                                    <p>{obra.Responsable || '-'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <label>Notas Adicionales:</label>
                                    <p>{obra.NotasAdicionales || '-'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Sección de Archivos */}
                              <div className="files-section">
                                <h3>📄 Archivos del Proyecto</h3>
                                <div className="files-grid">
                                  <div className="file-card">
                                    <div className="file-icon">📄</div>
                                    <div className="file-info">
                                      <h4>Contrato</h4>
                                      {obra.ContratoFile ? (
                                        <div className="file-actions">
                                          <button className="btn-download" onClick={() => downloadFile(obra.ContratoFile)}>
                                            ⬇️ Descargar
                                          </button>
                                          <button className="btn-view-file" onClick={() => viewFile(obra.ContratoFile)}>
                                            👁️ Ver
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="no-file">No disponible</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="file-card">
                                    <div className="file-icon">🎨</div>
                                    <div className="file-info">
                                      <h4>Planos</h4>
                                      {obra.PlanosFile ? (
                                        <div className="file-actions">
                                          <button className="btn-download" onClick={() => downloadFile(obra.PlanosFile)}>
                                            ⬇️ Descargar
                                          </button>
                                          <button className="btn-view-file" onClick={() => viewFile(obra.PlanosFile)}>
                                            👁️ Ver
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="no-file">No disponible</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="file-card">
                                    <div className="file-icon">🖼️</div>
                                    <div className="file-info">
                                      <h4>Imágenes Adicionales</h4>
                                      {obra.ImagenesFile ? (
                                        <div className="file-actions">
                                          <button className="btn-download" onClick={() => downloadFile(obra.ImagenesFile)}>
                                            ⬇️ Descargar
                                          </button>
                                          <button className="btn-view-file" onClick={() => viewFile(obra.ImagenesFile)}>
                                            👁️ Ver
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="no-file">No disponible</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <ObraForm
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
};

// Funciones auxiliares para descargar y visualizar archivos
const downloadFile = (fileUrl) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileUrl.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const viewFile = (fileUrl) => {
  window.open(fileUrl, '_blank');
};

export default ObrasList;
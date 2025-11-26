import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import '../styles/IngresosList.css';

function IngresosList() {
  const [ingresos, setIngresos] = useState([]);
  const [obras, setObras] = useState([]);
  const [tiposIngresoMap, setTiposIngresoMap] = useState({}); // Map para ID -> Nombre
  const [selectedObra, setSelectedObra] = useState('');
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState({ type: '', text: '' });
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  
  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoIngreso: 'all'
  });

  const [formData, setFormData] = useState({
    TipoIngresoID: '',
    Fecha: new Date().toISOString().split('T')[0],
    Descripcion: '',
    Monto: '',
    FacturaRuta: '',
    FacturaFileName: ''
  });

  const tiposIngreso = ['Estimación', 'Aporte Interno', 'Anticipo'];

  useEffect(() => {
    loadTiposIngreso();
    loadObras();
  }, []);

  useEffect(() => {
    if (selectedObra) {
      loadIngresos();
    }
  }, [selectedObra, filtros]);

  const loadTiposIngreso = async () => {
    try {
      const tipos = await api.catalogosAPI.getTiposIngreso();
      const map = {};
      (tipos || []).forEach(tipo => {
        map[tipo.TipoIngresoID] = tipo.Nombre;
      });
      setTiposIngresoMap(map);
    } catch (error) {
      console.error('Error loading tipos ingreso:', error);
    }
  };

  const loadObras = async () => {
    try {
      const response = await api.obrasAPI.getAll();
      setObras(response || []);
      if (response && response.length > 0) {
        setSelectedObra(response[0].ObraID);
      }
    } catch (error) {
      console.error('Error loading obras:', error);
    }
  };

  const loadIngresos = async () => {
    try {
      setLoading(true);
      const response = await api.ingresosAPI.getByObra(selectedObra);
      let datos = response || [];

      // Aplicar filtros
      if (filtros.tipoIngreso !== 'all') {
        datos = datos.filter(i => tiposIngresoMap[i.TipoIngresoID] === filtros.tipoIngreso);
      }

      if (filtros.fechaInicio) {
        datos = datos.filter(i => new Date(i.Fecha) >= new Date(filtros.fechaInicio));
      }

      if (filtros.fechaFin) {
        datos = datos.filter(i => new Date(i.Fecha) <= new Date(filtros.fechaFin));
      }

      setIngresos(datos);
      
      const total = datos.reduce((sum, ingreso) => sum + (ingreso.Monto || 0), 0);
      setTotalIngresos(total);

      // Prepare chart data - Distribution by category (tipo de ingreso)
      const categoryTotals = {};
      datos.forEach((ingreso) => {
        const tipoNombre = tiposIngresoMap[ingreso.TipoIngresoID] || 'Sin categoría';
        if (!categoryTotals[tipoNombre]) {
          categoryTotals[tipoNombre] = 0;
        }
        categoryTotals[tipoNombre] += ingreso.Monto || 0;
      });

      const categoryChartData = Object.entries(categoryTotals)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value
        }));
      
      setChartData(categoryChartData);
    } catch (error) {
      console.error('Error loading ingresos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar que TipoIngresoID sea un número válido
      const tipoIngresoID = parseInt(formData.TipoIngresoID);
      
      if (isNaN(tipoIngresoID) || tipoIngresoID === 0) {
        alert('Por favor selecciona un tipo de ingreso válido');
        return;
      }

      const dataToSubmit = {
        ObraID: parseInt(selectedObra),
        TipoIngresoID: tipoIngresoID,
        Fecha: formData.Fecha,
        Descripcion: formData.Descripcion,
        Monto: parseFloat(formData.Monto),
        FacturaRuta: formData.FacturaRuta || null
      };

      const response = await api.ingresosAPI.create(dataToSubmit);
      console.log('Respuesta:', response);
      
      setFormData({
        TipoIngresoID: '',
        Fecha: new Date().toISOString().split('T')[0],
        Descripcion: '',
        Monto: '',
        FacturaRuta: '',
        FacturaFileName: ''
      });
      setShowModal(false);
      await loadIngresos();
      alert('Ingreso guardado exitosamente');
    } catch (error) {
      console.error('Error creating ingreso:', error);
      alert('Error al guardar el ingreso: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      try {
        await api.ingresosAPI.delete(id);
        loadIngresos();
      } catch (error) {
        console.error('Error deleting ingreso:', error);
      }
    }
  };

  const handleFacturaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.warn('⚠️ No file selected');
      return;
    }

    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      setMensaje({ type: 'error', text: 'Por favor sube un archivo PDF válido' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMensaje({ type: 'error', text: 'El archivo no debe exceder 10MB' });
      return;
    }

    try {
      setUploading(true);
      console.log('📤 Iniciando upload del archivo (Ingresos):', file.name);
      
      const response = await api.uploadAPI.uploadFactura(file);
      console.log('📤 Full Upload response:', response);
      console.log('📤 response.filePath:', response.filePath);
      console.log('📤 Type of filePath:', typeof response.filePath);
      
      console.log('✅ Asignando FacturaRuta a formData:', response.filePath);
      
      setFormData(prev => { 
        const updated = {
          ...prev, 
          FacturaRuta: response.filePath, 
          FacturaFileName: file.name 
        };
        console.log('✅ FormData actualizado (Ingresos):', updated);
        return updated;
      });
      
      setMensaje({ type: 'success', text: '✅ Factura PDF subida correctamente' });
      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error uploading factura (Ingresos):', error);
      setMensaje({ type: 'error', text: 'Error al subir factura: ' + (error.message || 'Error desconocido') });
    } finally {
      setUploading(false);
    }
  };

  const getFullFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${filePath}`;
  };

  const openPDFViewer = (pdfRuta, fileName) => {
    const fullUrl = getFullFileUrl(pdfRuta);
    console.log('🔍 Opening PDF with URL:', fullUrl);
    setPdfUrl(fullUrl);
    setPdfFileName(fileName || 'Factura.pdf');
    setShowPDFViewer(true);
  };

  const closePDFViewer = () => {
    setShowPDFViewer(false);
    setPdfUrl('');
    setPdfFileName('');
  };

  const renderPDFViewer = () => {
    if (!showPDFViewer) return null;

    return (
      <div className="pdf-viewer-overlay" onClick={closePDFViewer}>
        <div className="pdf-viewer-modal" onClick={(e) => e.stopPropagation()}>
          <div className="pdf-viewer-header">
            <h2>📄 {pdfFileName}</h2>
            <button className="pdf-close-btn" onClick={closePDFViewer}>✕</button>
          </div>
          <div className="pdf-viewer-body">
            <iframe 
              src={pdfUrl} 
              title="PDF Viewer"
              className="pdf-iframe"
            ></iframe>
          </div>
          <div className="pdf-viewer-footer">
            <a href={pdfUrl} download={pdfFileName} className="btn-download-pdf">
              ⬇️ Descargar PDF
            </a>
            <button className="btn-close-pdf" onClick={closePDFViewer}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ingresos-container">
      <div className="ingresos-header">
        <h1>Ingresos</h1>
      </div>

      {/* Selector de Obra */}
      {obras.length > 0 && (
        <div className="obra-selector-container">
          <label htmlFor="obra-select" className="selector-label">Selecciona una Obra:</label>
          <select 
            id="obra-select"
            className="obra-select"
            value={selectedObra} 
            onChange={(e) => setSelectedObra(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {obras.map(obra => (
              <option key={obra.ObraID} value={obra.ObraID}>
                {obra.Nombre} - {obra.Ubicacion}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedObra && (
        <>
          {/* Tarjeta de Total Ingresos */}
          <div className="total-ingresos-card">
            <h3>Total Ingresos</h3>
            <p className="total-amount">${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          {/* Gráfica de Ingresos */}
          {!loading && chartData.length > 0 && (
            <div className="chart-box">
              <h2>🥧 Distribución de Ingresos por Categoría</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toLocaleString('es-MX')}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sección de Filtros */}
          <div className="filtros-section">
            <h3>🔍 Filtros</h3>
            <div className="filtros-grid">
              <div className="filtro-group">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="filtro-group">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="filtro-group">
                <label>Tipo de Ingreso:</label>
                <select name="tipoIngreso" value={filtros.tipoIngreso} onChange={handleFiltroChange}>
                  <option value="all">Todos</option>
                  {tiposIngreso.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Ingresos */}
          <div className="ingresos-table-section">
            <div className="section-header">
              <h2>📑 Lista de Ingresos</h2>
              <button className="btn-nuevo-ingreso" onClick={() => setShowModal(true)}>
                ➕ Nuevo Ingreso
              </button>
            </div>

            {loading ? (
              <div className="loading">Cargando...</div>
            ) : ingresos.length > 0 ? (
              <div className="table-responsive">
                <table className="ingresos-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Archivo</th>
                      <th>Monto</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.map(ingreso => (
                      <tr key={ingreso.IngresoID}>
                        <td className="fecha">{new Date(ingreso.Fecha).toLocaleDateString('es-MX')}</td>
                        <td className="tipo">
                          <span className={`tipo-badge ${tiposIngresoMap[ingreso.TipoIngresoID]?.toLowerCase().replace(' ', '-')}`}>
                            {tiposIngresoMap[ingreso.TipoIngresoID] || 'N/A'}
                          </span>
                        </td>
                        <td className="descripcion">{ingreso.Descripcion}</td>
                        <td className="archivo">
                          {ingreso.FacturaRuta ? (
                            <button 
                              className="archivo-item"
                              onClick={() => openPDFViewer(ingreso.FacturaRuta, ingreso.FacturaRuta.split('/').pop())}
                              title="Ver PDF"
                            >
                              <span className="archivo-nombre">
                                {ingreso.FacturaRuta.split('/').pop()}
                              </span>
                            </button>
                          ) : (
                            <span className="sin-archivo">—</span>
                          )}
                        </td>
                        <td className="monto">${ingreso.Monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="acciones">
                          {ingreso.FacturaRuta && (
                            <a href={getFullFileUrl(ingreso.FacturaRuta)} download target="_blank" rel="noopener noreferrer" className="btn-download" title="Descargar Factura">📄</a>
                          )}
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(ingreso.IngresoID)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No hay ingresos registrados para esta obra.</p>
            )}
          </div>

          {/* Modal para Nuevo Ingreso */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Nuevo Ingreso</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Tipo de Ingreso: *</label>
                      <select
                        name="TipoIngresoID"
                        value={formData.TipoIngresoID}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Selecciona un tipo --</option>
                        {Object.entries(tiposIngresoMap).map(([id, nombre]) => (
                          <option key={id} value={id}>{nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fecha: *</label>
                      <input
                        type="date"
                        name="Fecha"
                        value={formData.Fecha}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción: *</label>
                    <textarea
                      name="Descripcion"
                      value={formData.Descripcion}
                      onChange={handleInputChange}
                      placeholder="Ej: Pago de cliente, Aporte interno..."
                      required
                      rows="3"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Monto ($): *</label>
                      <input
                        type="number"
                        name="Monto"
                        value={formData.Monto}
                        onChange={handleInputChange}
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="documentos-section">
                    <label>📄 Factura PDF</label>
                    {formData.FacturaFileName && (
                      <p className="file-name">✓ {formData.FacturaFileName}</p>
                    )}
                    <div className="file-upload-area">
                      <input
                        id="factura-upload-ingresos"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFacturaUpload}
                        disabled={uploading}
                        className="file-input"
                      />
                      <label htmlFor="factura-upload-ingresos" className="file-label">
                        {uploading ? '⏳ Subiendo...' : '📁 Selecciona PDF de Factura'}
                      </label>
                    </div>
                  </div>

                  {mensaje.text && (
                    <div className={`mensaje ${mensaje.type}`}>
                      {mensaje.text}
                    </div>
                  )}

                  <div className="form-buttons">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit">
                      💾 Guardar Ingreso
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {renderPDFViewer()}
    </div>
  );
}

export default IngresosList;

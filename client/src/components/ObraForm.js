import React, { useState, useEffect } from 'react';
import { obrasAPI, clientesAPI } from '../services/api';
import '../styles/ObraForm.css';

function ObraForm({ onClose, onSaved }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(1);
  const [fileNames, setFileNames] = useState({
    ContratoPDF: '',
    Planos: '',
    Imagenes: ''
  });

  const [formData, setFormData] = useState({
    Nombre: '',
    ClienteID: '',
    Descripcion: '',
    Ubicacion: '',
    FechaInicio: new Date().toISOString().split('T')[0],
    FechaFin: '',
    MontoContrato: '',
    NumeroContrato: '',
    Responsable: '',
    NotasAdicionales: '',
    ContratoPDF: null,
    Planos: null,
    Imagenes: null
  });

  const estados = [
    { id: 1, nombre: 'Activa', emoji: '🟢' },
    { id: 2, nombre: 'Cerrada', emoji: '🔴' },
    { id: 3, nombre: 'Recuperada', emoji: '🔵' },
    { id: 4, nombre: 'Baja', emoji: '⚫' }
  ];

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clientesAPI.getAll();
      setClientes(response || []);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      setFileNames(prev => ({
        ...prev,
        [name]: file.name
      }));
    }
  };

  const clearFile = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
    
    setFileNames(prev => ({
      ...prev,
      [fieldName]: ''
    }));

    const inputElement = document.getElementById(`${fieldName}-input`);
    if (inputElement) {
      inputElement.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar campos requeridos
      if (!formData.Nombre || !formData.ClienteID || !formData.FechaInicio || 
          !formData.FechaFin || !formData.MontoContrato || !formData.Ubicacion || 
          !formData.Descripcion) {
        alert('Por favor completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Validar que FechaFin >= FechaInicio
      if (new Date(formData.FechaFin) < new Date(formData.FechaInicio)) {
        alert('La fecha de finalización debe ser igual o posterior a la de inicio');
        setLoading(false);
        return;
      }

      const dataToSubmit = {
        Nombre: formData.Nombre,
        ClienteID: parseInt(formData.ClienteID),
        Descripcion: formData.Descripcion,
        Ubicacion: formData.Ubicacion,
        FechaInicio: formData.FechaInicio,
        FechaFin: formData.FechaFin,
        MontoContrato: parseFloat(formData.MontoContrato),
        EstatusID: estadoSeleccionado,
        NumeroContrato: formData.NumeroContrato || null,
        Responsable: formData.Responsable || null,
        NotasAdicionales: formData.NotasAdicionales || null,
        CentroCostos: null
      };

      const result = await obrasAPI.create(dataToSubmit);
      
      // Aquí se podrían subir archivos a un servidor (por ahora solo se guardan los datos)
      // TODO: Implementar carga de archivos
      
      alert('✅ Proyecto creado exitosamente');
      
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating obra:', error);
      alert('❌ Error al crear el proyecto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="obra-form-overlay">
      <div className="obra-form-container">
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="form-wrapper">
          <div className="form-main">
            <h2>📐 Agregar Nuevo Proyecto</h2>
            <p className="subtitle">Registra un nuevo proyecto de construcción en el sistema</p>

            <form onSubmit={handleSubmit}>
              {/* Información Básica */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-icon">📋</span>
                  <h3>Información Básica</h3>
                </div>
                <p className="section-desc">Datos principales del proyecto</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre del proyecto: <span className="required">*</span></label>
                    <input
                      type="text"
                      name="Nombre"
                      value={formData.Nombre}
                      onChange={handleInputChange}
                      placeholder="Ej: Plaza Comercial Los Pinos"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cliente: <span className="required">*</span></label>
                    <select
                      name="ClienteID"
                      value={formData.ClienteID}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.ClienteID} value={cliente.ClienteID}>
                          {cliente.Nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Descripción: <span className="required">*</span></label>
                  <textarea
                    name="Descripcion"
                    value={formData.Descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción general del proyecto..."
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Ubicación de la obra: <span className="required">*</span></label>
                  <input
                    type="text"
                    name="Ubicacion"
                    value={formData.Ubicacion}
                    onChange={handleInputChange}
                    placeholder="Dirección o zona de construcción"
                    required
                  />
                </div>
              </div>

              {/* Cronograma y Presupuesto */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-icon">📅</span>
                  <h3>Cronograma y Presupuesto</h3>
                </div>
                <p className="section-desc">Fechas y montos del proyecto</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Fecha de inicio: <span className="required">*</span></label>
                    <input
                      type="date"
                      name="FechaInicio"
                      value={formData.FechaInicio}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha estimada de finalización: <span className="required">*</span></label>
                    <input
                      type="date"
                      name="FechaFin"
                      value={formData.FechaFin}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Presupuesto total: <span className="required">*</span></label>
                  <div className="input-with-prefix">
                    <span className="prefix">$</span>
                    <input
                      type="number"
                      name="MontoContrato"
                      value={formData.MontoContrato}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-icon">ℹ️</span>
                  <h3>Información Adicional (Opcional)</h3>
                </div>
                <p className="section-desc">Datos complementarios del proyecto</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Número de contrato</label>
                    <input
                      type="text"
                      name="NumeroContrato"
                      value={formData.NumeroContrato}
                      onChange={handleInputChange}
                      placeholder="Ej: CTR-2025-001"
                    />
                  </div>

                  <div className="form-group">
                    <label>Responsable del proyecto</label>
                    <input
                      type="text"
                      name="Responsable"
                      value={formData.Responsable}
                      onChange={handleInputChange}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Notas adicionales</label>
                  <textarea
                    name="NotasAdicionales"
                    value={formData.NotasAdicionales}
                    onChange={handleInputChange}
                    placeholder="Observaciones, comentarios o detalles adicionales..."
                    rows="2"
                  />
                </div>
              </div>

              {/* Documentos */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-icon">📄</span>
                  <h3>Documentos del Proyecto (Opcional)</h3>
                </div>
                <p className="section-desc">Sube contratos, planos e imágenes de referencia</p>

                <div className="documents-grid">
                  {/* Contrato */}
                  <div className="document-upload">
                    <div className="doc-label-wrapper">
                      <label htmlFor="ContratoPDF-input" className="doc-label">
                        <span className="doc-icon">📄</span>
                        <span className="doc-title">Contrato</span>
                        <span className="doc-subtitle">(PDF)</span>
                      </label>
                      <input
                        id="ContratoPDF-input"
                        type="file"
                        name="ContratoPDF"
                        onChange={handleFileChange}
                        accept=".pdf"
                        hidden
                      />
                    </div>
                    {fileNames.ContratoPDF && (
                      <div className="file-selected">
                        <span>✓ {fileNames.ContratoPDF}</span>
                        <button
                          type="button"
                          className="btn-clear-file"
                          onClick={() => clearFile('ContratoPDF')}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Planos */}
                  <div className="document-upload">
                    <div className="doc-label-wrapper">
                      <label htmlFor="Planos-input" className="doc-label">
                        <span className="doc-icon">🎨</span>
                        <span className="doc-title">Planos</span>
                        <span className="doc-subtitle">(PDF, DWG, JPG, PNG)</span>
                      </label>
                      <input
                        id="Planos-input"
                        type="file"
                        name="Planos"
                        onChange={handleFileChange}
                        accept=".pdf,.dwg,.jpg,.png,.jpeg"
                        hidden
                      />
                    </div>
                    {fileNames.Planos && (
                      <div className="file-selected">
                        <span>✓ {fileNames.Planos}</span>
                        <button
                          type="button"
                          className="btn-clear-file"
                          onClick={() => clearFile('Planos')}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Imágenes */}
                  <div className="document-upload">
                    <div className="doc-label-wrapper">
                      <label htmlFor="Imagenes-input" className="doc-label">
                        <span className="doc-icon">🖼️</span>
                        <span className="doc-title">Imágenes</span>
                        <span className="doc-subtitle">(JPG, PNG)</span>
                      </label>
                      <input
                        id="Imagenes-input"
                        type="file"
                        name="Imagenes"
                        onChange={handleFileChange}
                        accept=".jpg,.png,.jpeg"
                        hidden
                      />
                    </div>
                    {fileNames.Imagenes && (
                      <div className="file-selected">
                        <span>✓ {fileNames.Imagenes}</span>
                        <button
                          type="button"
                          className="btn-clear-file"
                          onClick={() => clearFile('Imagenes')}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  ✕ Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? '⏳ Guardando...' : '✓ Guardar Proyecto'}
                </button>
              </div>
            </form>
          </div>

          {/* Panel Lateral */}
          <div className="form-sidebar">
            <div className="status-card">
              <h4>Estado del Proyecto</h4>
              <p className="status-label">Selecciona el estado actual</p>
              
              <div className="status-options">
                {estados.map(estado => (
                  <button
                    key={estado.id}
                    className={`status-btn ${estadoSeleccionado === estado.id ? 'active' : ''}`}
                    onClick={() => setEstadoSeleccionado(estado.id)}
                    type="button"
                  >
                    {estado.emoji} {estado.nombre}
                  </button>
                ))}
              </div>

              <p className="status-desc">
                {estadoSeleccionado === 1 && '🟢 El proyecto está en fase de planeación.'}
                {estadoSeleccionado === 2 && '🔴 El proyecto ha sido cerrado.'}
                {estadoSeleccionado === 3 && '🔵 El proyecto fue recuperado.'}
                {estadoSeleccionado === 4 && '⚫ El proyecto está marcado como baja.'}
              </p>
            </div>

            <div className="required-fields">
              <h4>Campos Requeridos</h4>
              <ul>
                <li>✓ Nombre del proyecto</li>
                <li>✓ Cliente</li>
                <li>✓ Descripción</li>
                <li>✓ Ubicación</li>
                <li>✓ Fecha de inicio</li>
                <li>✓ Fecha de fin</li>
                <li>✓ Presupuesto</li>
              </ul>
            </div>

            <div className="info-card">
              <h4>ℹ️ Información</h4>
              <p>Los archivos (contrato, planos, imágenes) son opcionales y pueden agregarse posteriormente.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ObraForm;
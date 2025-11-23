import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ProveedoresList.css';

const ProveedoresList = () => {
  const [proveedores, setProveedores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedProveedor, setExpandedProveedor] = useState(null);
  const [historialCompras, setHistorialCompras] = useState({});
  const [loadingHistorial, setLoadingHistorial] = useState({});

  const [formData, setFormData] = useState({
    Nombre: '',
    RFC: '',
    TipoProveedorID: 1,
    Telefono: '',
    Correo: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando proveedores...');
      const proveedoresData = await api.proveedoresAPI?.getAll();
      console.log('Respuesta proveedores:', proveedoresData);
      
      const tiposData = await api.catalogosAPI?.getTiposProveedor?.();
      console.log('Respuesta tipos:', tiposData);

      const proveedoresArray = Array.isArray(proveedoresData) ? proveedoresData : [];
      const tiposArray = Array.isArray(tiposData) ? tiposData : [];

      setProveedores(proveedoresArray);
      setTipos(tiposArray);
      
      if (tiposArray.length === 0) {
        console.warn('⚠️ No se encontraron tipos de proveedor');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'TipoProveedorID' ? parseInt(value) : value
    }));
  };

  const openModal = (proveedor = null) => {
    if (proveedor) {
      setEditingId(proveedor.ProveedorID);
      setFormData({
        Nombre: proveedor.Nombre,
        RFC: proveedor.RFC || '',
        TipoProveedorID: proveedor.TipoProveedorID || (tipos.length > 0 ? tipos[0].TipoProveedorID : 1),
        Telefono: proveedor.Telefono || '',
        Correo: proveedor.Correo || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        Nombre: '',
        RFC: '',
        TipoProveedorID: tipos.length > 0 ? tipos[0].TipoProveedorID : 1,
        Telefono: '',
        Correo: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      Nombre: '',
      RFC: '',
      TipoProveedorID: tipos.length > 0 ? tipos[0].TipoProveedorID : 1,
      Telefono: '',
      Correo: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar que el nombre no esté vacío
      if (!formData.Nombre || formData.Nombre.trim() === '') {
        setError('El nombre del proveedor es requerido');
        return;
      }

      // Validar TipoProveedorID
      if (!formData.TipoProveedorID || formData.TipoProveedorID === 0) {
        setError('Debes seleccionar un tipo de proveedor');
        return;
      }

      console.log('Guardando proveedor:', formData);

      let response;
      if (editingId) {
        response = await api.proveedoresAPI?.update(editingId, formData);
        console.log('Proveedor actualizado:', response);
      } else {
        response = await api.proveedoresAPI?.create(formData);
        console.log('Proveedor creado:', response);
      }
      
      closeModal();
      setError(null);
      await fetchData();
      alert(editingId ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente');
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      setError('Error al guardar proveedor: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (proveedorId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      try {
        await api.proveedoresAPI?.delete(proveedorId);
        fetchData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  const handleStatusChange = async (proveedor) => {
    // Funcionalidad removida - La BD no tiene campo Activo
    console.log('Cambio de estado no disponible en esta versión');
  };

  const toggleHistorial = async (proveedorId) => {
    if (expandedProveedor === proveedorId) {
      setExpandedProveedor(null);
    } else {
      setExpandedProveedor(proveedorId);
      if (!historialCompras[proveedorId]) {
        await cargarHistorial(proveedorId);
      }
    }
  };

  const cargarHistorial = async (proveedorId) => {
    try {
      setLoadingHistorial(prev => ({ ...prev, [proveedorId]: true }));
      const compras = await api.materialesAPI?.getAll() || [];
      const comprasArray = Array.isArray(compras) ? compras : [];
      const comprasProveedor = comprasArray.filter(c => c.ProveedorID === proveedorId);
      setHistorialCompras(prev => ({
        ...prev,
        [proveedorId]: comprasProveedor
      }));
    } catch (err) {
      console.error('Error loading purchase history:', err);
      setHistorialCompras(prev => ({
        ...prev,
        [proveedorId]: []
      }));
    } finally {
      setLoadingHistorial(prev => ({ ...prev, [proveedorId]: false }));
    }
  };

  const getTipoNombre = (tipoId) => {
    const tipo = tipos.find(t => t.TipoProveedorID === tipoId);
    return tipo ? tipo.Nombre : 'Desconocido';
  };

  if (loading) {
    return <div className="loading">⏳ Cargando proveedores...</div>;
  }

  return (
    <div className="proveedores-container">
      <div className="proveedores-header">
        <div className="header-content">
          <h1>🤝 Proveedores</h1>
          <p className="subtitle">Gestiona tu red de proveedores y su historial de compras</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          ➕ Nuevo Proveedor
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="proveedores-grid">
        {proveedores.length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay proveedores registrados aún</p>
            <button className="btn-secondary" onClick={() => openModal()}>
              Agregar primer proveedor
            </button>
          </div>
        ) : (
          proveedores.map(proveedor => (
            <div key={proveedor.ProveedorID} className="proveedor-card">
              <div className="card-header">
                <div className="proveedor-info">
                  <h3>{proveedor.Nombre}</h3>
                  <span className={`badge badge-${getTipoNombre(proveedor.TipoProveedorID).toLowerCase()}`}>
                    {getTipoNombre(proveedor.TipoProveedorID)}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">RFC:</span>
                  <span className="value">{proveedor.RFC || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Teléfono:</span>
                  <span className="value">{proveedor.Telefono || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Correo:</span>
                  <span className="value email">{proveedor.Correo || '—'}</span>
                </div>
              </div>

              <div className="card-footer">
                <div className="action-buttons">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => openModal(proveedor)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(proveedor.ProveedorID)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
                <button
                  className={`btn-expand ${expandedProveedor === proveedor.ProveedorID ? 'expanded' : ''}`}
                  onClick={() => toggleHistorial(proveedor.ProveedorID)}
                  title="Ver historial de compras"
                >
                  {expandedProveedor === proveedor.ProveedorID ? '▼' : '▶'} Historial ({(historialCompras[proveedor.ProveedorID] || []).length})
                </button>
              </div>

              {expandedProveedor === proveedor.ProveedorID && (
                <div className="historial-section">
                  {loadingHistorial[proveedor.ProveedorID] ? (
                    <p className="loading-text">⏳ Cargando historial...</p>
                  ) : (historialCompras[proveedor.ProveedorID] || []).length === 0 ? (
                    <p className="empty-text">📭 Sin historial de compras</p>
                  ) : (
                    <div className="historial-table">
                      <table>
                        <thead>
                          <tr>
                            <th>📅 Fecha</th>
                            <th>📦 Productos</th>
                            <th>💰 Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(historialCompras[proveedor.ProveedorID] || []).map((compra) => (
                            <tr key={compra.CompraID}>
                              <td>{new Date(compra.Fecha).toLocaleDateString('es-MX')}</td>
                              <td>{compra.FolioFactura || '—'}</td>
                              <td>${parseFloat(compra.TotalCompra || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="proveedor-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre: *</label>
                  <input
                    type="text"
                    name="Nombre"
                    placeholder="Nombre del proveedor"
                    value={formData.Nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo: *</label>
                  <select
                    name="TipoProveedorID"
                    value={formData.TipoProveedorID}
                    onChange={handleInputChange}
                    required
                  >
                    {tipos && tipos.length > 0 ? (
                      tipos.map(tipo => (
                        <option key={tipo.TipoProveedorID} value={tipo.TipoProveedorID}>
                          {tipo.Nombre}
                        </option>
                      ))
                    ) : (
                      <option value="">-- Cargando tipos --</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>RFC:</label>
                  <input
                    type="text"
                    name="RFC"
                    placeholder="RFC"
                    value={formData.RFC}
                    onChange={handleInputChange}
                    maxLength="13"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    name="Telefono"
                    placeholder="Teléfono"
                    value={formData.Telefono}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Correo:</label>
                  <input
                    type="email"
                    name="Correo"
                    placeholder="correo@ejemplo.com"
                    value={formData.Correo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Actualizar' : 'Crear'} Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedoresList;

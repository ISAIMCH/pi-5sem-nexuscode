import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/TrabajadoresList.css';

function TrabajadoresList() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [estatuses, setEstatuses] = useState([]);

  const [formData, setFormData] = useState({
    NombreCompleto: '',
    Puesto: '',
    NSS: '',
    EstatusID: 1
  });

  const puestos = ['Obrero', 'Maestro', 'Supervisor', 'Capataz', 'Ingeniero', 'Técnico', 'Chofer', 'Bodeguero'];

  useEffect(() => {
    loadEstatuses();
    loadTrabajadores();
  }, []);

  const loadEstatuses = async () => {
    try {
      const response = await api.catalogosAPI.getEstatuses();
      setEstatuses(response || []);
    } catch (error) {
      console.error('Error loading estatuses:', error);
    }
  };

  const loadTrabajadores = async () => {
    try {
      setLoading(true);
      const response = await api.trabajadoresAPI.getAll();
      setTrabajadores(response || []);
    } catch (error) {
      console.error('Error loading trabajadores:', error);
      alert('Error al cargar trabajadores');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === 'EstatusID' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.NombreCompleto.trim() || !formData.Puesto.trim()) {
        alert('Por favor completa los campos requeridos');
        return;
      }

      const dataToSubmit = {
        NombreCompleto: formData.NombreCompleto,
        Puesto: formData.Puesto,
        NSS: formData.NSS || null,
        EstatusID: parseInt(formData.EstatusID)
      };

      if (editingId) {
        await api.trabajadoresAPI.update(editingId, dataToSubmit);
        alert('Trabajador actualizado exitosamente');
      } else {
        await api.trabajadoresAPI.create(dataToSubmit);
        alert('Trabajador guardado exitosamente');
      }

      setFormData({
        NombreCompleto: '',
        Puesto: '',
        NSS: '',
        EstatusID: 1
      });
      setEditingId(null);
      setShowModal(false);
      await loadTrabajadores();
    } catch (error) {
      console.error('Error saving trabajador:', error);
      alert('Error al guardar el trabajador: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleEdit = (trabajador) => {
    setFormData({
      NombreCompleto: trabajador.NombreCompleto,
      Puesto: trabajador.Puesto,
      NSS: trabajador.NSS || '',
      EstatusID: trabajador.EstatusID
    });
    setEditingId(trabajador.TrabajadorID);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este trabajador?')) {
      try {
        await api.trabajadoresAPI.delete(id);
        await loadTrabajadores();
        alert('Trabajador eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting trabajador:', error);
        alert('Error al eliminar el trabajador');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      NombreCompleto: '',
      Puesto: '',
      NSS: '',
      EstatusID: 1
    });
  };

  const getEstatusName = (estatusId) => {
    const estatus = estatuses.find(e => e.EstatusID === estatusId);
    return estatus ? estatus.Nombre : 'N/A';
  };

  return (
    <div className="trabajadores-container">
      <div className="trabajadores-header">
        <h1>👷 Trabajadores</h1>
      </div>

      <div className="trabajadores-table-section">
        <div className="section-header">
          <h2>📋 Lista de Trabajadores</h2>
          <button className="btn-nuevo" onClick={() => setShowModal(true)}>
            ➕ Nuevo Trabajador
          </button>
        </div>

        {loading ? (
          <div className="loading">Cargando...</div>
        ) : trabajadores.length > 0 ? (
          <div className="table-responsive">
            <table className="trabajadores-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Puesto</th>
                  <th>NSS</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trabajadores.map(trabajador => (
                  <tr key={trabajador.TrabajadorID}>
                    <td className="nombre">{trabajador.NombreCompleto}</td>
                    <td className="puesto">{trabajador.Puesto}</td>
                    <td className="nss">{trabajador.NSS || '—'}</td>
                    <td className="estatus">
                      <span className={`estatus-badge ${getEstatusName(trabajador.EstatusID)?.toLowerCase()}`}>
                        {getEstatusName(trabajador.EstatusID)}
                      </span>
                    </td>
                    <td className="acciones">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(trabajador)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(trabajador.TrabajadorID)}
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
          <p className="no-data">No hay trabajadores registrados.</p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre Completo: *</label>
                  <input
                    type="text"
                    name="NombreCompleto"
                    value={formData.NombreCompleto}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez García"
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Puesto: *</label>
                  <select
                    name="Puesto"
                    value={formData.Puesto}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Selecciona un puesto --</option>
                    {puestos.map(puesto => (
                      <option key={puesto} value={puesto}>{puesto}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estatus:</label>
                  <select
                    name="EstatusID"
                    value={formData.EstatusID}
                    onChange={handleInputChange}
                  >
                    {estatuses.map(estatus => (
                      <option key={estatus.EstatusID} value={estatus.EstatusID}>
                        {estatus.Nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>NSS (Número de Seguridad Social):</label>
                <input
                  type="text"
                  name="NSS"
                  value={formData.NSS}
                  onChange={handleInputChange}
                  placeholder="Ej: 12345678901"
                />
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  💾 {editingId ? 'Guardar Cambios' : 'Guardar Trabajador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrabajadoresList;

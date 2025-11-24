import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/TrabajadoresList.css';

function TrabajadoresList() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [estatuses, setEstatuses] = useState([]);
  const [selectedObra, setSelectedObra] = useState('');

  const [formData, setFormData] = useState({
    NombreCompleto: '',
    ApellidoPaterno: '',
    ApellidoMaterno: '',
    Puesto: '',
    Oficio: '',
    NSS: '',
    ClaveEmpleado: '',
    INE_Clave: '',
    CURP: '',
    RFC: '',
    FechaNacimiento: '',
    Telefono: '',
    Correo: '',
    Direccion: '',
    Banco: '',
    CuentaBancaria: '',
    EsFacturador: false,
    ObraActualID: '',
    EstatusID: 1
  });

  const puestos = ['Obrero', 'Maestro', 'Supervisor', 'Capataz', 'Ingeniero', 'Técnico', 'Chofer', 'Bodeguero'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedObra) {
      loadTrabajadoresByObra();
    } else {
      loadTrabajadores();
    }
  }, [selectedObra]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [estatusesData, obrasData] = await Promise.all([
        api.catalogosAPI.getEstatuses(),
        api.obrasAPI.getAll()
      ]);
      setEstatuses(estatusesData || []);
      setObras(obrasData || []);
      await loadTrabajadores();
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('Error al cargar datos iniciales');
    } finally {
      setLoading(false);
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

  const loadTrabajadoresByObra = async () => {
    try {
      setLoading(true);
      const response = await api.trabajadoresAPI.getByObra(selectedObra);
      setTrabajadores(response || []);
    } catch (error) {
      console.error('Error loading trabajadores by obra:', error);
      alert('Error al cargar trabajadores de la obra');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'EstatusID' ? parseInt(value) : value
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
        ApellidoPaterno: formData.ApellidoPaterno || null,
        ApellidoMaterno: formData.ApellidoMaterno || null,
        Puesto: formData.Puesto,
        Oficio: formData.Oficio || null,
        NSS: formData.NSS || null,
        ClaveEmpleado: formData.ClaveEmpleado || null,
        INE_Clave: formData.INE_Clave || null,
        CURP: formData.CURP || null,
        RFC: formData.RFC || null,
        FechaNacimiento: formData.FechaNacimiento || null,
        Telefono: formData.Telefono || null,
        Correo: formData.Correo || null,
        Direccion: formData.Direccion || null,
        Banco: formData.Banco || null,
        CuentaBancaria: formData.CuentaBancaria || null,
        EsFacturador: formData.EsFacturador ? 1 : 0,
        ObraActualID: formData.ObraActualID ? parseInt(formData.ObraActualID) : null,
        EstatusID: parseInt(formData.EstatusID)
      };

      if (editingId) {
        await api.trabajadoresAPI.update(editingId, dataToSubmit);
        alert('Trabajador actualizado exitosamente');
      } else {
        const newTrabajador = await api.trabajadoresAPI.create(dataToSubmit);
        
        // If a project is selected, assign the worker to it
        if (selectedObra && newTrabajador && newTrabajador.TrabajadorID) {
          await api.trabajadoresAPI.assignToObra(newTrabajador.TrabajadorID, selectedObra);
        }
        
        alert('Trabajador guardado exitosamente');
      }

      resetForm();
      setShowModal(false);
      
      if (selectedObra) {
        await loadTrabajadoresByObra();
      } else {
        await loadTrabajadores();
      }
    } catch (error) {
      console.error('Error saving trabajador:', error);
      alert('Error al guardar el trabajador: ' + (error.message || 'Error desconocido'));
    }
  };

  const resetForm = () => {
    setFormData({
      NombreCompleto: '',
      ApellidoPaterno: '',
      ApellidoMaterno: '',
      Puesto: '',
      Oficio: '',
      NSS: '',
      ClaveEmpleado: '',
      INE_Clave: '',
      CURP: '',
      RFC: '',
      FechaNacimiento: '',
      Telefono: '',
      Correo: '',
      Direccion: '',
      Banco: '',
      CuentaBancaria: '',
      EsFacturador: false,
      ObraActualID: '',
      EstatusID: 1
    });
    setEditingId(null);
  };

  const handleEdit = (trabajador) => {
    setFormData({
      NombreCompleto: trabajador.NombreCompleto,
      ApellidoPaterno: trabajador.ApellidoPaterno || '',
      ApellidoMaterno: trabajador.ApellidoMaterno || '',
      Puesto: trabajador.Puesto,
      Oficio: trabajador.Oficio || '',
      NSS: trabajador.NSS || '',
      ClaveEmpleado: trabajador.ClaveEmpleado || '',
      INE_Clave: trabajador.INE_Clave || '',
      CURP: trabajador.CURP || '',
      RFC: trabajador.RFC || '',
      FechaNacimiento: trabajador.FechaNacimiento ? trabajador.FechaNacimiento.split('T')[0] : '',
      Telefono: trabajador.Telefono || '',
      Correo: trabajador.Correo || '',
      Direccion: trabajador.Direccion || '',
      Banco: trabajador.Banco || '',
      CuentaBancaria: trabajador.CuentaBancaria || '',
      EsFacturador: trabajador.EsFacturador || false,
      ObraActualID: trabajador.ObraActualID || '',
      EstatusID: trabajador.EstatusID
    });
    setEditingId(trabajador.TrabajadorID);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este trabajador?')) {
      try {
        await api.trabajadoresAPI.delete(id);
        
        if (selectedObra) {
          await loadTrabajadoresByObra();
        } else {
          await loadTrabajadores();
        }
        
        alert('Trabajador eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting trabajador:', error);
        alert('Error al eliminar el trabajador');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getEstatusName = (estatusId) => {
    const estatus = estatuses.find(e => e.EstatusID === estatusId);
    return estatus ? estatus.Nombre : 'N/A';
  };

  const getObraName = (obraId) => {
    const obra = obras.find(o => o.ObraID === obraId);
    return obra ? obra.Nombre : 'N/A';
  };

  return (
    <div className="trabajadores-container">
      <div className="trabajadores-header">
        <h1>👷 Trabajadores</h1>
      </div>

      <div className="filtro-section">
        <label>Filtrar por Proyecto:</label>
        <select 
          value={selectedObra} 
          onChange={(e) => setSelectedObra(e.target.value)}
          className="obra-select"
        >
          <option value="">-- Todos los Proyectos --</option>
          {obras.map(obra => (
            <option key={obra.ObraID} value={obra.ObraID}>
              {obra.Nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="trabajadores-table-section">
        <div className="section-header">
          <h2>📋 Lista de Trabajadores {selectedObra ? `- ${getObraName(selectedObra)}` : ''}</h2>
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
                  <th>Nombre Completo</th>
                  <th>Puesto</th>
                  <th>Clave</th>
                  <th>RFC</th>
                  <th>Correo</th>
                  <th>Obra Actual</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trabajadores.map(trabajador => (
                  <tr key={trabajador.TrabajadorID}>
                    <td className="nombre">{trabajador.NombreCompleto}</td>
                    <td className="puesto">{trabajador.Puesto}</td>
                    <td className="codigo">{trabajador.ClaveEmpleado || '—'}</td>
                    <td className="rfc">{trabajador.RFC || '—'}</td>
                    <td className="correo">{trabajador.Correo || '—'}</td>
                    <td className="obra">{getObraName(trabajador.ObraActualID) || '—'}</td>
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
          <p className="no-data">
            {selectedObra 
              ? 'No hay trabajadores asignados a este proyecto.' 
              : 'No hay trabajadores registrados.'}
          </p>
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
              <div className="form-section">
                <h3>Información Básica</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre(s): *</label>
                    <input
                      type="text"
                      name="NombreCompleto"
                      value={formData.NombreCompleto}
                      onChange={handleInputChange}
                      placeholder="Ej: Juan"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido Paterno:</label>
                    <input
                      type="text"
                      name="ApellidoPaterno"
                      value={formData.ApellidoPaterno}
                      onChange={handleInputChange}
                      placeholder="Ej: Pérez"
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido Materno:</label>
                    <input
                      type="text"
                      name="ApellidoMaterno"
                      value={formData.ApellidoMaterno}
                      onChange={handleInputChange}
                      placeholder="Ej: García"
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
                    <label>Oficio/Especialidad:</label>
                    <input
                      type="text"
                      name="Oficio"
                      value={formData.Oficio}
                      onChange={handleInputChange}
                      placeholder="Ej: Carpintero, Soldador"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Proyecto Actual:</label>
                    <select
                      name="ObraActualID"
                      value={formData.ObraActualID}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Sin asignar --</option>
                      {obras.map(obra => (
                        <option key={obra.ObraID} value={obra.ObraID}>
                          {obra.Nombre}
                        </option>
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
              </div>

              <div className="form-section">
                <h3>Identificación</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Clave de Empleado:</label>
                    <input
                      type="text"
                      name="ClaveEmpleado"
                      value={formData.ClaveEmpleado}
                      onChange={handleInputChange}
                      placeholder="Ej: EMP-001"
                    />
                  </div>
                  <div className="form-group">
                    <label>NSS:</label>
                    <input
                      type="text"
                      name="NSS"
                      value={formData.NSS}
                      onChange={handleInputChange}
                      placeholder="Ej: 12345678901"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>INE (Clave de Elector):</label>
                    <input
                      type="text"
                      name="INE_Clave"
                      value={formData.INE_Clave}
                      onChange={handleInputChange}
                      placeholder="Ej: INE123456789ABC"
                      maxLength="18"
                    />
                  </div>
                  <div className="form-group">
                    <label>CURP:</label>
                    <input
                      type="text"
                      name="CURP"
                      value={formData.CURP}
                      onChange={handleInputChange}
                      placeholder="Ej: PXGX000101HDFRNN09"
                      maxLength="18"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>RFC:</label>
                    <input
                      type="text"
                      name="RFC"
                      value={formData.RFC}
                      onChange={handleInputChange}
                      placeholder="Ej: PEGJX000101XXX"
                      maxLength="13"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      name="FechaNacimiento"
                      value={formData.FechaNacimiento}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Información de Contacto</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Teléfono:</label>
                    <input
                      type="tel"
                      name="Telefono"
                      value={formData.Telefono}
                      onChange={handleInputChange}
                      placeholder="Ej: 5551234567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico:</label>
                    <input
                      type="email"
                      name="Correo"
                      value={formData.Correo}
                      onChange={handleInputChange}
                      placeholder="Ej: juan@example.com"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Dirección:</label>
                    <input
                      type="text"
                      name="Direccion"
                      value={formData.Direccion}
                      onChange={handleInputChange}
                      placeholder="Ej: Calle Principal 123, Apt 5"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Información Bancaria</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Banco:</label>
                    <input
                      type="text"
                      name="Banco"
                      value={formData.Banco}
                      onChange={handleInputChange}
                      placeholder="Ej: Banco Azteca"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cuenta Bancaria (CLABE/Número):</label>
                    <input
                      type="text"
                      name="CuentaBancaria"
                      value={formData.CuentaBancaria}
                      onChange={handleInputChange}
                      placeholder="Ej: 0123456789012345"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="EsFacturador"
                        checked={formData.EsFacturador}
                        onChange={(e) => setFormData({...formData, EsFacturador: e.target.checked})}
                      />
                      {' '}Es Facturador
                    </label>
                  </div>
                </div>
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

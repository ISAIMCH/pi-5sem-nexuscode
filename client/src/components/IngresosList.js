import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    FacturaRef: ''
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

      // Prepare chart data
      let accumulated = 0;
      const chartData = datos
        .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha))
        .map((ingreso) => {
          accumulated += ingreso.Monto || 0;
          return {
            fecha: new Date(ingreso.Fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
            monto: ingreso.Monto,
            acumulado: accumulated
          };
        });
      setChartData(chartData);
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
      // Convertir el nombre del tipo a su ID correspondiente
      let tipoIngresoID = null;
      Object.entries(tiposIngresoMap).forEach(([id, nombre]) => {
        if (nombre === formData.TipoIngresoID) {
          tipoIngresoID = parseInt(id);
        }
      });

      const dataToSubmit = {
        ObraID: parseInt(selectedObra),
        TipoIngresoID: tipoIngresoID,
        Fecha: formData.Fecha,
        Descripcion: formData.Descripcion,
        Monto: parseFloat(formData.Monto),
        FacturaRef: formData.FacturaRef || null
      };

      console.log('Enviando data:', dataToSubmit);

      await api.ingresosAPI.create(dataToSubmit);
      
      setFormData({
        TipoIngresoID: '',
        Fecha: new Date().toISOString().split('T')[0],
        Descripcion: '',
        Monto: '',
        FacturaRef: ''
      });
      setShowModal(false);
      await loadIngresos();
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
              <h2>📊 Evolución de Ingresos Acumulados</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                  <Legend />
                  <Bar 
                    dataKey="acumulado" 
                    fill="#2ecc71" 
                    name="Acumulado ($)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
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
                      <th>Factura</th>
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
                        <td className="factura">
                          {ingreso.FacturaRef ? (
                            <span className="factura-ref">{ingreso.FacturaRef}</span>
                          ) : (
                            <span className="sin-factura">—</span>
                          )}
                        </td>
                        <td className="monto">${ingreso.Monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="acciones">
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
                        <option value="">-- Selecciona --</option>
                        {tiposIngreso.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
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
                    <div className="form-group">
                      <label>Referencia de Factura:</label>
                      <input
                        type="text"
                        name="FacturaRef"
                        value={formData.FacturaRef}
                        onChange={handleInputChange}
                        placeholder="Ej: FAC-001"
                      />
                    </div>
                  </div>

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
    </div>
  );
}

export default IngresosList;

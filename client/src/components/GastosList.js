import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import SueldosListView from './SueldosListView';
import '../styles/GastosList.css';

function GastosList() {
  const [obras, setObras] = useState([]);
  const [selectedObra, setSelectedObra] = useState('');
  const [activeTab, setActiveTab] = useState('Materiales');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Datos por categoría
  const [materiales, setMateriales] = useState([]);
  const [maquinaria, setMaquinaria] = useState([]);
  
  // Datos de soporte
  const [proveedores, setProveedores] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  
  // Gráficas
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalGastos, setTotalGastos] = useState(0);
  
  // Formulario dinámico
  const [formData, setFormData] = useState({});

  const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  const categorias = [
    { key: 'Materiales', icon: '🏗️', label: 'Materiales' },
    { key: 'Maquinaria', icon: '🚜', label: 'Maquinaria' },
    { key: 'Sueldos', icon: '💰', label: 'Sueldos' }
  ];

  useEffect(() => {
    loadObras();
    loadSupportData();
  }, []);

  useEffect(() => {
    if (selectedObra) {
      loadAllGastos();
    }
  }, [selectedObra]);

  const loadSupportData = async () => {
    try {
      const provResp = await api.proveedoresAPI.getAll();
      const trabResp = await api.trabajadoresAPI?.getAll();
      
      // Ensure all responses are arrays
      setProveedores(Array.isArray(provResp) ? provResp : []);
      setTrabajadores(Array.isArray(trabResp) ? trabResp : []);
    } catch (error) {
      console.error('Error loading support data:', error);
      // Set empty arrays on error
      setProveedores([]);
      setTrabajadores([]);
    }
  };

  const loadObras = async () => {
    try {
      const response = await api.obrasAPI.getAll();
      const obrasArray = Array.isArray(response) ? response : [];
      setObras(obrasArray);
      if (obrasArray && obrasArray.length > 0) {
        setSelectedObra(obrasArray[0].ObraID);
      }
    } catch (error) {
      console.error('Error loading obras:', error);
      setObras([]);
    }
  };

  const loadAllGastos = async () => {
    try {
      setLoading(true);
      const materialesResp = await api.materialesAPI?.getByObra(selectedObra);
      const maquinariaResp = await api.maquinariaAPI?.getByObra(selectedObra);
      
      // Asegurar que todas las respuestas son arrays
      const mat = Array.isArray(materialesResp) ? materialesResp : [];
      const maq = Array.isArray(maquinariaResp) ? maquinariaResp : [];
      
      setMateriales(mat);
      setMaquinaria(maq);
      
      calculateTotalsAndCharts(mat, maq);
    } catch (error) {
      console.error('Error loading gastos:', error);
      // Set empty arrays on error
      setMateriales([]);
      setMaquinaria([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalsAndCharts = (mat, maq) => {
    const totales = {
      Materiales: (mat || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0),
      Maquinaria: (maq || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0)
    };

    const total = Object.values(totales).reduce((sum, val) => sum + val, 0);
    setTotalGastos(total);

    const categoryChartData = Object.entries(totales).map(([name, value]) => ({
      name,
      value
    }));
    setCategoryData(categoryChartData);

    // Preparar datos para gráfica acumulada (por fecha)
    const allGastos = [
      ...(mat || []).map(m => ({ fecha: m.Fecha, monto: m.TotalCompra, tipo: 'Materiales' })),
      ...(maq || []).map(m => ({ fecha: m.FechaInicio, monto: m.CostoTotal, tipo: 'Maquinaria' }))
    ];

    const sortedGastos = allGastos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    let accumulated = 0;
    const chartData = sortedGastos.map((gasto) => ({
      fecha: new Date(gasto.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      monto: gasto.monto,
      acumulado: (accumulated += gasto.monto || 0)
    }));
    setChartData(chartData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({});
  };

  const openModalForCategory = (category) => {
    resetForm();
    setActiveTab(category);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      switch (activeTab) {
        case 'Materiales':
          await submitMaterial();
          break;
        case 'Maquinaria':
          await submitMaquinaria();
          break;
        default:
          break;
      }
      resetForm();
      setShowModal(false);
      await loadAllGastos();
    } catch (error) {
      console.error('Error creating gasto:', error);
      alert('Error al guardar: ' + (error.message || 'Error desconocido'));
    }
  };

  const submitMaterial = async () => {
    const data = {
      ObraID: parseInt(selectedObra),
      ProveedorID: parseInt(formData.ProveedorID),
      Fecha: formData.Fecha,
      FolioFactura: formData.FolioFactura || null,
      TotalCompra: parseFloat(formData.TotalCompra)
    };
    await api.materialesAPI?.create(data);
  };

  const submitMaquinaria = async () => {
    const data = {
      ObraID: parseInt(selectedObra),
      ProveedorID: parseInt(formData.ProveedorID),
      Descripcion: formData.Descripcion,
      FechaInicio: formData.FechaInicio,
      FechaFin: formData.FechaFin || null,
      CostoTotal: parseFloat(formData.CostoTotal)
    };
    await api.maquinariaAPI?.create(data);
  };

  const handleDelete = async (id, category) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        switch (category) {
          case 'Materiales':
            await api.materialesAPI?.delete(id);
            break;
          case 'Maquinaria':
            await api.maquinariaAPI?.delete(id);
            break;
          default:
            break;
        }
        await loadAllGastos();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const renderFormForCategory = () => {
    switch (activeTab) {
      case 'Materiales':
        return (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>Proveedor: *</label>
                <select
                  name="ProveedorID"
                  value={formData.ProveedorID || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  {proveedores.map(p => (
                    <option key={p.ProveedorID} value={p.ProveedorID}>{p.Nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha: *</label>
                <input
                  type="date"
                  name="Fecha"
                  value={formData.Fecha || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Factura:</label>
                <input
                  type="text"
                  name="FolioFactura"
                  value={formData.FolioFactura || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: FAC-001"
                />
              </div>
              <div className="form-group">
                <label>Total: *</label>
                <input
                  type="number"
                  name="TotalCompra"
                  value={formData.TotalCompra || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </>
        );
      
      case 'Maquinaria':
        return (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>Proveedor: *</label>
                <select
                  name="ProveedorID"
                  value={formData.ProveedorID || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  {proveedores.map(p => (
                    <option key={p.ProveedorID} value={p.ProveedorID}>{p.Nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Equipo: *</label>
                <input
                  type="text"
                  name="Descripcion"
                  value={formData.Descripcion || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: Grúa, Excavadora, etc."
                  required
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Fecha Inicio: *</label>
                <input
                  type="date"
                  name="FechaInicio"
                  value={formData.FechaInicio || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  name="FechaFin"
                  value={formData.FechaFin || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Costo: *</label>
                <input
                  type="number"
                  name="CostoTotal"
                  value={formData.CostoTotal || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const renderTableForCategory = () => {
    if (activeTab === 'Materiales') {
      return (
        <div className="table-responsive">
          <table className="gastos-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Factura</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map(m => (
                <tr key={m.CompraID}>
                  <td>{proveedores.find(p => p.ProveedorID === m.ProveedorID)?.Nombre || m.ProveedorID}</td>
                  <td>{new Date(m.Fecha).toLocaleDateString('es-MX')}</td>
                  <td className="factura">{m.FolioFactura ? <span className="factura-ref">{m.FolioFactura}</span> : <span className="sin-factura">—</span>}</td>
                  <td className="monto">${m.TotalCompra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="acciones">
                    <button className="btn-delete" onClick={() => handleDelete(m.CompraID, 'Materiales')} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'Maquinaria') {
      return (
        <div className="table-responsive">
          <table className="gastos-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Equipo</th>
                <th>Período</th>
                <th>Costo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maquinaria.map(m => (
                <tr key={m.RentaID}>
                  <td>{proveedores.find(p => p.ProveedorID === m.ProveedorID)?.Nombre || m.ProveedorID}</td>
                  <td>{m.Descripcion}</td>
                  <td>{new Date(m.FechaInicio).toLocaleDateString('es-MX')} {m.FechaFin ? `- ${new Date(m.FechaFin).toLocaleDateString('es-MX')}` : '- En curso'}</td>
                  <td className="monto">${m.CostoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="acciones">
                    <button className="btn-delete" onClick={() => handleDelete(m.RentaID, 'Maquinaria')} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const getCategoryTotal = (category) => {
    switch (category) {
      case 'Materiales':
        return (materiales || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0);
      case 'Maquinaria':
        return (maquinaria || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0);
      default:
        return 0;
    }
  };

  return (
    <div className="gastos-container">
      <div className="gastos-header">
        <h1>Gastos</h1>
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
          {/* Tarjeta de Total Gastos */}
          <div className="total-gastos-card">
            <h3>Total Gastos</h3>
            <p className="total-amount">${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          {/* Gráficas */}
          {!loading && (
            <div className="charts-container">
              {chartData.length > 0 && (
                <div className="chart-box">
                  <h2>📊 Evolución de Gastos Acumulados</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                      <Legend />
                      <Bar 
                        dataKey="acumulado" 
                        fill="#e74c3c" 
                        name="Gastos Acumulados ($)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {categoryData.length > 0 && (
                <div className="chart-box">
                  <h2>🥧 Distribución por Categoría</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: $${value.toLocaleString('es-MX')}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Menú unificado de Categorías */}
          <div className="categories-menu">
            <h3>🏷️ Categorías de Gastos</h3>
            <div className="categories-tabs">
              {categorias.map(cat => {
                let count = 0;
                let total = 0;
                
                if (cat.key === 'Materiales') {
                  count = (materiales || []).length;
                  total = (materiales || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0);
                } else if (cat.key === 'Maquinaria') {
                  count = (maquinaria || []).length;
                  total = (maquinaria || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0);
                }
                
                return (
                  <button
                    key={cat.key}
                    className={`category-tab ${activeTab === cat.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.key)}
                  >
                    <span className="icon">{cat.icon}</span>
                    <div className="tab-info">
                      <span className="label">{cat.label}</span>
                      {cat.key !== 'Sueldos' && <span className="badge">{count}</span>}
                    </div>
                    {total > 0 && <span className="amount">${total.toLocaleString('es-MX')}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mostrar Lista de Sueldos O Tabla de Gastos */}
          {activeTab === 'Sueldos' ? (
            <SueldosListView selectedObra={selectedObra} />
          ) : (
            <div className="gastos-table-section">
              <div className="section-header">
                <h2>💰 {categorias.find(c => c.key === activeTab)?.label}</h2>
                <button className="btn-nuevo-gasto" onClick={() => openModalForCategory(activeTab)}>
                  ➕ Nuevo Gasto
                </button>
              </div>

              {loading ? (
                <div className="loading">Cargando...</div>
              ) : 
                (activeTab === 'Materiales' && materiales.length > 0) ||
                (activeTab === 'Maquinaria' && maquinaria.length > 0)
                ? renderTableForCategory()
                : (
                  <p className="no-data">No hay registros en esta categoría.</p>
                )}
            </div>
          )}

          {/* Modal para Nuevo Gasto */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Nuevo {activeTab === 'Materiales' ? 'Material' : activeTab === 'Maquinaria' ? 'Equipo' : activeTab === 'Nómina' ? 'Pago' : activeTab === 'Retenciones' ? 'Retención' : 'Gasto General'}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                  {renderFormForCategory()}

                  <div className="form-buttons">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit">
                      💾 Guardar
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

export default GastosList;

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
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
  const [nomina, setNomina] = useState([]);
  const [generales, setGenerales] = useState([]);
  const [retenciones, setRetenciones] = useState([]);
  
  // Datos de soporte
  const [proveedores, setProveedores] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [tiposRetencion, setTiposRetencion] = useState([]);
  const [categoriasGasto, setCategoriasGasto] = useState([]);
  
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
    { key: 'Nómina', icon: '👨‍💼', label: 'Nómina' },
    { key: 'Generales', icon: '📋', label: 'Generales' },
    { key: 'Retenciones', icon: '💼', label: 'Retenciones' }
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
      const tiposResp = await api.catalogosAPI.getTiposRetencion?.();
      const categResp = await api.catalogosAPI.getCategoriasGasto?.();
      
      // Ensure all responses are arrays
      setProveedores(Array.isArray(provResp) ? provResp : []);
      setTrabajadores(Array.isArray(trabResp) ? trabResp : []);
      setTiposRetencion(Array.isArray(tiposResp) ? tiposResp : []);
      setCategoriasGasto(Array.isArray(categResp) ? categResp : []);
    } catch (error) {
      console.error('Error loading support data:', error);
      // Set empty arrays on error
      setProveedores([]);
      setTrabajadores([]);
      setTiposRetencion([]);
      setCategoriasGasto([]);
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
      const nominaResp = await api.nominaAPI?.getByObra(selectedObra);
      const generalesResp = await api.gastosGeneralesAPI?.getByObra(selectedObra);
      const retencionesResp = await api.retencionesAPI?.getByObra(selectedObra);
      
      // Asegurar que todas las respuestas son arrays
      const mat = Array.isArray(materialesResp) ? materialesResp : [];
      const maq = Array.isArray(maquinariaResp) ? maquinariaResp : [];
      const nom = Array.isArray(nominaResp) ? nominaResp : [];
      const gen = Array.isArray(generalesResp) ? generalesResp : [];
      const ret = Array.isArray(retencionesResp) ? retencionesResp : [];
      
      setMateriales(mat);
      setMaquinaria(maq);
      setNomina(nom);
      setGenerales(gen);
      setRetenciones(ret);
      
      calculateTotalsAndCharts(mat, maq, nom, gen, ret);
    } catch (error) {
      console.error('Error loading gastos:', error);
      // Set empty arrays on error
      setMateriales([]);
      setMaquinaria([]);
      setNomina([]);
      setGenerales([]);
      setRetenciones([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalsAndCharts = (mat, maq, nom, gen, ret) => {
    const totales = {
      Materiales: (mat || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0),
      Maquinaria: (maq || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0),
      Nómina: (nom || []).reduce((sum, n) => sum + (n.MontoPagado || 0), 0),
      Generales: (gen || []).reduce((sum, g) => sum + (g.Monto || 0), 0),
      Retenciones: (ret || []).reduce((sum, r) => sum + (r.Monto || 0), 0)
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
      ...(maq || []).map(m => ({ fecha: m.FechaInicio, monto: m.CostoTotal, tipo: 'Maquinaria' })),
      ...(nom || []).map(n => ({ fecha: n.FechaPago, monto: n.MontoPagado, tipo: 'Nómina' })),
      ...(gen || []).map(g => ({ fecha: g.Fecha, monto: g.Monto, tipo: 'Generales' })),
      ...(ret || []).map(r => ({ fecha: r.Fecha, monto: r.Monto, tipo: 'Retenciones' }))
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
        case 'Nómina':
          await submitNomina();
          break;
        case 'Generales':
          await submitGeneral();
          break;
        case 'Retenciones':
          await submitRetencion();
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

  const submitNomina = async () => {
    const data = {
      ObraID: parseInt(selectedObra),
      TrabajadorID: parseInt(formData.TrabajadorID),
      FechaPago: formData.FechaPago,
      MontoPagado: parseFloat(formData.MontoPagado),
      Comprobante: formData.Comprobante || null
    };
    await api.nominaAPI?.create(data);
  };

  const submitGeneral = async () => {
    const data = {
      ObraID: parseInt(selectedObra),
      Fecha: formData.Fecha,
      CategoriaID: parseInt(formData.CategoriaID),
      Descripcion: formData.Descripcion,
      ProveedorID: formData.ProveedorID ? parseInt(formData.ProveedorID) : null,
      Monto: parseFloat(formData.Monto),
      FacturaRef: formData.FacturaRef || null
    };
    await api.gastosGeneralesAPI?.create(data);
  };

  const submitRetencion = async () => {
    const data = {
      ObraID: parseInt(selectedObra),
      TipoRetencionID: parseInt(formData.TipoRetencionID),
      Fecha: formData.Fecha,
      Monto: parseFloat(formData.Monto),
      EstatusID: parseInt(formData.EstatusID || 1)
    };
    await api.retencionesAPI?.create(data);
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
          case 'Nómina':
            await api.nominaAPI?.delete(id);
            break;
          case 'Generales':
            await api.gastosGeneralesAPI?.delete(id);
            break;
          case 'Retenciones':
            await api.retencionesAPI?.delete(id);
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
                <label>Factura:</label>
                <input
                  type="text"
                  name="Factura"
                  value={formData.Factura || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: FAC-001"
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <select
                  name="Estado"
                  value={formData.Estado || ''}
                  onChange={handleInputChange}
                >
                  <option value="">-- Selecciona --</option>
                  <option value="Activa">Activa</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
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
      
      case 'Nómina':
        return (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>Trabajador: *</label>
                <select
                  name="TrabajadorID"
                  value={formData.TrabajadorID || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  {trabajadores.map(t => (
                    <option key={t.TrabajadorID} value={t.TrabajadorID}>{t.NombreCompleto}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Pago: *</label>
                <input
                  type="date"
                  name="FechaPago"
                  value={formData.FechaPago || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Comprobante:</label>
                <input
                  type="text"
                  name="Comprobante"
                  value={formData.Comprobante || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: NOM-001"
                />
              </div>
              <div className="form-group">
                <label>Monto: *</label>
                <input
                  type="number"
                  name="MontoPagado"
                  value={formData.MontoPagado || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </>
        );
      
      case 'Generales':
        return (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>Categoría: *</label>
                <select
                  name="CategoriaID"
                  value={formData.CategoriaID || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  {categoriasGasto.map(c => (
                    <option key={c.CategoriaID} value={c.CategoriaID}>{c.Nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Proveedor:</label>
                <select
                  name="ProveedorID"
                  value={formData.ProveedorID || ''}
                  onChange={handleInputChange}
                >
                  <option value="">-- Selecciona --</option>
                  {proveedores.map(p => (
                    <option key={p.ProveedorID} value={p.ProveedorID}>{p.Nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Descripción: *</label>
              <textarea
                name="Descripcion"
                value={formData.Descripcion || ''}
                onChange={handleInputChange}
                placeholder="Detalles del gasto..."
                rows="3"
                required
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Factura:</label>
                <input
                  type="text"
                  name="FacturaRef"
                  value={formData.FacturaRef || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: FAC-001"
                />
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
                <label>Monto: *</label>
                <input
                  type="number"
                  name="Monto"
                  value={formData.Monto || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </>
        );
      
      case 'Retenciones':
        return (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>Concepto: *</label>
                <select
                  name="TipoRetencionID"
                  value={formData.TipoRetencionID || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  {tiposRetencion.map(t => (
                    <option key={t.TipoRetencionID} value={t.TipoRetencionID}>{t.Nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado: *</label>
                <select
                  name="EstatusID"
                  value={formData.EstatusID || '1'}
                  onChange={handleInputChange}
                >
                  <option value="1">Activa</option>
                  <option value="2">Cerrada</option>
                  <option value="3">Recuperada</option>
                  <option value="4">Baja</option>
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Documento:</label>
                <input
                  type="text"
                  name="Documento"
                  value={formData.Documento || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: DOC-001"
                />
              </div>
              <div className="form-group">
                <label>Monto: *</label>
                <input
                  type="number"
                  name="Monto"
                  value={formData.Monto || ''}
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
                <th>Factura</th>
                <th>Estado</th>
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
                  <td className="factura">{m.Factura ? <span className="factura-ref">{m.Factura}</span> : <span className="sin-factura">—</span>}</td>
                  <td><span className={`badge badge-${m.Estado?.toLowerCase() || 'activa'}`}>{m.Estado || 'Activa'}</span></td>
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
    
    if (activeTab === 'Nómina') {
      return (
        <div className="table-responsive">
          <table className="gastos-table">
            <thead>
              <tr>
                <th>Trabajador</th>
                <th>Fecha de Pago</th>
                <th>Comprobante</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {nomina.map(n => (
                <tr key={n.NominaID}>
                  <td>{trabajadores.find(t => t.TrabajadorID === n.TrabajadorID)?.NombreCompleto || n.TrabajadorID}</td>
                  <td>{new Date(n.FechaPago).toLocaleDateString('es-MX')}</td>
                  <td className="factura">{n.Comprobante ? <span className="factura-ref">{n.Comprobante}</span> : <span className="sin-factura">—</span>}</td>
                  <td className="monto">${n.MontoPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="acciones">
                    <button className="btn-delete" onClick={() => handleDelete(n.NominaID, 'Nómina')} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'Generales') {
      return (
        <div className="table-responsive">
          <table className="gastos-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Descripción</th>
                <th>Factura</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {generales.map(g => (
                <tr key={g.GastoID}>
                  <td>{categoriasGasto.find(c => c.CategoriaID === g.CategoriaID)?.Nombre || g.CategoriaID}</td>
                  <td>{proveedores.find(p => p.ProveedorID === g.ProveedorID)?.Nombre || (g.ProveedorID ? g.ProveedorID : '—')}</td>
                  <td>{g.Descripcion}</td>
                  <td className="factura">{g.FacturaRef ? <span className="factura-ref">{g.FacturaRef}</span> : <span className="sin-factura">—</span>}</td>
                  <td className="monto">${g.Monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="acciones">
                    <button className="btn-delete" onClick={() => handleDelete(g.GastoID, 'Generales')} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'Retenciones') {
      return (
        <div className="table-responsive">
          <table className="gastos-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Estado</th>
                <th>Documento</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {retenciones.map(r => (
                <tr key={r.RetencionID}>
                  <td>{tiposRetencion.find(t => t.TipoRetencionID === r.TipoRetencionID)?.Nombre || r.TipoRetencionID}</td>
                  <td><span className={`badge badge-${r.EstatusID || 1}`}>{['Activa', 'Cerrada', 'Recuperada', 'Baja'][r.EstatusID - 1] || 'Activa'}</span></td>
                  <td className="factura">{r.Documento ? <span className="factura-ref">{r.Documento}</span> : <span className="sin-factura">—</span>}</td>
                  <td className="monto">${r.Monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="acciones">
                    <button className="btn-delete" onClick={() => handleDelete(r.RetencionID, 'Retenciones')} title="Eliminar">🗑️</button>
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
      case 'Nómina':
        return (nomina || []).reduce((sum, n) => sum + (n.MontoPagado || 0), 0);
      case 'Generales':
        return (generales || []).reduce((sum, g) => sum + (g.Monto || 0), 0);
      case 'Retenciones':
        return (retenciones || []).reduce((sum, r) => sum + (r.Monto || 0), 0);
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
                const count = 
                  cat.key === 'Materiales' ? (materiales || []).length :
                  cat.key === 'Maquinaria' ? (maquinaria || []).length :
                  cat.key === 'Nómina' ? (nomina || []).length :
                  cat.key === 'Generales' ? (generales || []).length :
                  cat.key === 'Retenciones' ? (retenciones || []).length : 0;
                
                const total = 
                  cat.key === 'Materiales' ? (materiales || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0) :
                  cat.key === 'Maquinaria' ? (maquinaria || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0) :
                  cat.key === 'Nómina' ? (nomina || []).reduce((sum, n) => sum + (n.MontoPagado || 0), 0) :
                  cat.key === 'Generales' ? (generales || []).reduce((sum, g) => sum + (g.Monto || 0), 0) :
                  cat.key === 'Retenciones' ? (retenciones || []).reduce((sum, r) => sum + (r.Monto || 0), 0) : 0;
                
                return (
                  <button
                    key={cat.key}
                    className={`category-tab ${activeTab === cat.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.key)}
                  >
                    <span className="icon">{cat.icon}</span>
                    <div className="tab-info">
                      <span className="label">{cat.label}</span>
                      <span className="badge">{count}</span>
                    </div>
                    {total > 0 && <span className="amount">${total.toLocaleString('es-MX')}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabla de Gastos por Categoría */}
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
              (activeTab === 'Maquinaria' && maquinaria.length > 0) ||
              (activeTab === 'Nómina' && nomina.length > 0) ||
              (activeTab === 'Generales' && generales.length > 0) ||
              (activeTab === 'Retenciones' && retenciones.length > 0)
              ? renderTableForCategory()
              : (
                <p className="no-data">No hay registros en esta categoría.</p>
              )}
          </div>

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

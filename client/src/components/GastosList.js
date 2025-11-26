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
  const [sueldosPagos, setSueldosPagos] = useState([]);
  
  // Datos de soporte
  const [proveedores, setProveedores] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  
  // Gráficas
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalGastos, setTotalGastos] = useState(0);
  
  // Formulario dinámico
  const [formData, setFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompra, setEditingCompra] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [facturaFileName, setFacturaFileName] = useState('');
  const [mensaje, setMensaje] = useState({ type: '', text: '' });
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

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
      const sueldosResp = await api.nominaAPI?.getByObra(selectedObra);
      
      // Asegurar que todas las respuestas son arrays
      const mat = Array.isArray(materialesResp) ? materialesResp : [];
      const maq = Array.isArray(maquinariaResp) ? maquinariaResp : [];
      const sueldos = Array.isArray(sueldosResp) ? sueldosResp : [];
      
      setMateriales(mat);
      setMaquinaria(maq);
      setSueldosPagos(sueldos);
      
      calculateTotalsAndCharts(mat, maq, sueldos);
    } catch (error) {
      console.error('Error loading gastos:', error);
      // Set empty arrays on error
      setMateriales([]);
      setMaquinaria([]);
      setSueldosPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalsAndCharts = (mat, maq, sueldos) => {
    const totales = {
      Materiales: (mat || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0),
      Maquinaria: (maq || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0),
      Sueldos: (sueldos || []).reduce((sum, s) => sum + (s.MontoPagado || 0), 0)
    };

    const total = Object.values(totales).reduce((sum, val) => sum + val, 0);
    setTotalGastos(total);

    const categoryChartData = Object.entries(totales)
      .filter(([name, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value
      }));
    setCategoryData(categoryChartData);

    // Preparar datos para gráfica mensual (sin acumulación)
    // Agrupar todos los gastos (Materiales, Maquinaria, Sueldos) por mes
    const allGastos = [
      ...(mat || []).map(m => ({ fecha: m.Fecha, monto: m.TotalCompra, tipo: 'Materiales' })),
      ...(maq || []).map(m => ({ fecha: m.FechaInicio, monto: m.CostoTotal, tipo: 'Maquinaria' })),
      ...(sueldos || []).map(s => ({ fecha: s.Fecha, monto: s.MontoPagado, tipo: 'Sueldos' }))
    ];

    // Si hay gastos, crear rango de meses desde el primero hasta el último
    if (allGastos.length > 0) {
      // Encontrar fecha mínima y máxima
      const fechas = allGastos.map(g => new Date(g.fecha));
      const fechaMin = new Date(Math.min(...fechas));
      const fechaMax = new Date(Math.max(...fechas));

      // Generar array de meses (YYYY-MM)
      const mesesRango = [];
      let mesActual = new Date(fechaMin.getFullYear(), fechaMin.getMonth(), 1);
      while (mesActual <= fechaMax) {
        const mesKey = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}`;
        mesesRango.push({
          mes: mesKey,
          fecha: new Date(mesActual),
          mesFormato: new Date(mesActual).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' }),
          total: 0
        });
        mesActual.setMonth(mesActual.getMonth() + 1);
      }

      // Sumar gastos por mes
      allGastos.forEach(gasto => {
        const fecha = new Date(gasto.fecha);
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        const mesObj = mesesRango.find(m => m.mes === mesKey);
        if (mesObj) {
          mesObj.total += gasto.monto || 0;
        }
      });

      // Crear chartData con solo el total del mes (sin acumulado)
      const chartData = mesesRango.map(mes => ({
        mes: mes.mes,
        mesFormato: mes.mesFormato,
        total: Math.round(mes.total * 100) / 100 // Redondear a 2 decimales
      }));

      setChartData(chartData);
    } else {
      // Si no hay gastos, dejar vacío
      setChartData([]);
    }
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
    setFacturaFileName('');
    setMensaje('');
  };

  const openModalForCategory = (category) => {
    resetForm();
    setActiveTab(category);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📤 handleSubmit - activeTab:', activeTab);
      console.log('📤 handleSubmit - formData:', formData);
      
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
      setMensaje({ type: 'success', text: '✅ Guardado exitosamente' });
      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      setMensaje({ type: 'error', text: 'Error al guardar: ' + error.message });
    }
  };

  const submitMaterial = async () => {
    try {
      // Validaciones previas
      if (!formData.ProveedorID) {
        throw new Error('Debe seleccionar un proveedor');
      }
      if (!formData.Fecha) {
        throw new Error('Debe ingresar la fecha');
      }
      if (!formData.TotalCompra) {
        throw new Error('Debe ingresar el total de la compra');
      }

      const data = {
        ObraID: parseInt(selectedObra),
        ProveedorID: parseInt(formData.ProveedorID),
        Fecha: formData.Fecha,
        TotalCompra: parseFloat(formData.TotalCompra),
        FacturaRuta: formData.FacturaRuta || null
      };

      console.log('📝 Enviando Material al servidor:', JSON.stringify(data, null, 2));
      console.log('📝 FacturaRuta value:', data.FacturaRuta);
      console.log('📝 FacturaRuta type:', typeof data.FacturaRuta);
      console.log('📝 FacturaRuta length:', data.FacturaRuta ? data.FacturaRuta.length : 'null');
      console.log('📝 formData completo:', formData);
      
      const response = await api.materialesAPI?.create(data);
      console.log('✅ Material creado:', response);
      console.log('✅ Response FacturaRuta:', response?.FacturaRuta);
      
      // Recargar datos inmediatamente después
      console.log('🔄 Iniciando loadAllGastos()...');
      await loadAllGastos();
      console.log('✅ loadAllGastos() completado');
    } catch (error) {
      console.error('❌ Error al crear material:', error);
      throw error;
    }
  };

  const submitMaquinaria = async () => {
    try {
      // Validaciones previas
      if (!formData.ProveedorID) {
        throw new Error('Debe seleccionar un proveedor');
      }
      if (!formData.Descripcion) {
        throw new Error('Debe ingresar la descripción del equipo');
      }
      if (!formData.FechaInicio) {
        throw new Error('Debe ingresar la fecha de inicio');
      }
      if (!formData.CostoTotal) {
        throw new Error('Debe ingresar el costo total');
      }

      const data = {
        ObraID: parseInt(selectedObra),
        ProveedorID: parseInt(formData.ProveedorID),
        Descripcion: formData.Descripcion,
        FechaInicio: formData.FechaInicio,
        FechaFin: formData.FechaFin || null,
        CostoTotal: parseFloat(formData.CostoTotal),
        FacturaRuta: formData.FacturaRuta || null
      };
      
      console.log('📝 Enviando Maquinaria al servidor:', JSON.stringify(data, null, 2));
      console.log('📝 FacturaRuta value:', data.FacturaRuta);
      console.log('📝 FacturaRuta type:', typeof data.FacturaRuta);
      console.log('📝 FacturaRuta length:', data.FacturaRuta ? data.FacturaRuta.length : 'null');
      console.log('📝 formData completo:', formData);
      
      const response = await api.maquinariaAPI?.create(data);
      console.log('✅ Maquinaria creada:', response);
      console.log('✅ Response FacturaRuta:', response?.FacturaRuta);
      
      // Recargar datos inmediatamente después
      console.log('🔄 Iniciando loadAllGastos()...');
      await loadAllGastos();
      console.log('✅ loadAllGastos() completado');
    } catch (error) {
      console.error('❌ Error al crear maquinaria:', error);
      throw error;
    }
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

  const handleFacturaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      const response = await api.uploadAPI.uploadFactura(file);
      setEditFormData(prev => ({ ...prev, FacturaRuta: response.filePath }));
      setFacturaFileName(file.name);
      setMensaje({ type: 'success', text: '✅ Factura PDF subida correctamente' });
      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading factura:', error);
      setMensaje({ type: 'error', text: 'Error al subir factura: ' + (error.message || 'Error desconocido') });
    } finally {
      setUploading(false);
    }
  };

  const handleFacturaUploadForCreate = async (e) => {
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
      console.log('📤 Iniciando upload del archivo:', file.name);
      
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
        console.log('✅ FormData actualizado:', updated);
        return updated;
      });
      
      setMensaje({ type: 'success', text: '✅ Factura PDF subida correctamente' });
      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error uploading factura:', error);
      setMensaje({ type: 'error', text: 'Error al subir factura: ' + (error.message || 'Error desconocido') });
    } finally {
      setUploading(false);
    }
  };

  const handleFacturaUploadForMaquinaria = async (e) => {
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
      console.log('📤 Iniciando upload del archivo (Maquinaria):', file.name);
      
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
        console.log('✅ FormData actualizado (Maquinaria):', updated);
        return updated;
      });
      
      setMensaje({ type: 'success', text: '✅ Factura PDF subida correctamente' });
      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error uploading factura (Maquinaria):', error);
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
    // Construir la URL absoluta del PDF
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
            <div className="documentos-section">
              <label>📄 Factura PDF</label>
              {formData.FacturaFileName && (
                <p className="file-name">✓ {formData.FacturaFileName}</p>
              )}
              <div className="file-upload-area">
                <input
                  id="factura-upload-create"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFacturaUploadForCreate(e)}
                  disabled={uploading}
                  className="file-input"
                />
                <label htmlFor="factura-upload-create" className="file-label">
                  {uploading ? '⏳ Subiendo...' : '📁 Selecciona PDF de Factura'}
                </label>
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
            <div className="documentos-section">
              <label>📄 Factura PDF</label>
              {formData.FacturaFileName && (
                <p className="file-name">✓ {formData.FacturaFileName}</p>
              )}
              <div className="file-upload-area">
                <input
                  id="factura-upload-maquinaria"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFacturaUploadForMaquinaria(e)}
                  disabled={uploading}
                  className="file-input"
                />
                <label htmlFor="factura-upload-maquinaria" className="file-label">
                  {uploading ? '⏳ Subiendo...' : '📁 Selecciona PDF de Factura'}
                </label>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const handleEditCompra = (compra) => {
    setEditingCompra(compra);
    
    if (activeTab === 'Materiales') {
      setEditFormData({
        Fecha: compra.Fecha,
        TotalCompra: compra.TotalCompra,
        FacturaRuta: compra.FacturaRuta || null
      });
    } else if (activeTab === 'Maquinaria') {
      setEditFormData({
        Descripcion: compra.Descripcion,
        FechaInicio: compra.FechaInicio,
        FechaFin: compra.FechaFin || null,
        CostoTotal: compra.CostoTotal,
        FacturaRuta: compra.FacturaRuta || null
      });
    }
    
    setFacturaFileName(compra.FacturaRuta ? compra.FacturaRuta.split('/').pop() : '');
    setShowEditModal(true);
  };

  const handleSaveEditCompra = async () => {
    try {
      if (activeTab === 'Materiales') {
        await api.materialesAPI.update(editingCompra.CompraID, editFormData);
      } else if (activeTab === 'Maquinaria') {
        await api.maquinariaAPI.update(editingCompra.RentaID, editFormData);
      }
      
      setMensaje({ type: 'success', text: '✅ Actualización completada correctamente' });
      setShowEditModal(false);
      loadAllGastos();
      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating:', error);
      setMensaje({ type: 'error', text: 'Error al actualizar: ' + (error.message || 'Error desconocido') });
    }
  };

  const renderEditModal = () => {
    if (showEditModal) {
      const isMaterial = activeTab === 'Materiales';
      const isMaquinaria = activeTab === 'Maquinaria';
      
      return (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ {isMaterial ? 'Editar Compra de Materiales' : 'Editar Renta de Maquinaria'}</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {mensaje.text && (
                <div className={`mensaje ${mensaje.type}`}>
                  {mensaje.text}
                </div>
              )}
              
              {isMaterial && (
                <>
                  <div className="form-group">
                    <label>📅 Fecha</label>
                    <input
                      type="date"
                      value={editFormData.Fecha || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, Fecha: e.target.value }))}
                      disabled={uploading}
                    />
                  </div>
                  <div className="form-group">
                    <label>💵 Total</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={editFormData.TotalCompra || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, TotalCompra: parseFloat(e.target.value) }))}
                      disabled={uploading}
                      step="0.01"
                    />
                  </div>
                </>
              )}
              
              {isMaquinaria && (
                <>
                  <div className="form-group">
                    <label>Equipo: *</label>
                    <input
                      type="text"
                      value={editFormData.Descripcion || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, Descripcion: e.target.value }))}
                      placeholder="Ej: Grúa, Excavadora, etc."
                      disabled={uploading}
                      required
                    />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Fecha Inicio: *</label>
                      <input
                        type="date"
                        value={editFormData.FechaInicio || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, FechaInicio: e.target.value }))}
                        disabled={uploading}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha Fin:</label>
                      <input
                        type="date"
                        value={editFormData.FechaFin || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, FechaFin: e.target.value }))}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Costo: *</label>
                    <input
                      type="number"
                      value={editFormData.CostoTotal || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, CostoTotal: parseFloat(e.target.value) }))}
                      step="0.01"
                      placeholder="0.00"
                      disabled={uploading}
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="documentos-section">
                <label>📄 Factura PDF</label>
                <div className="file-upload-area">
                  {facturaFileName && (
                    <p className="file-name">✓ {facturaFileName}</p>
                  )}
                  <input
                    id="factura-upload-edit"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFacturaUpload}
                    disabled={uploading}
                    className="file-input"
                  />
                  <label htmlFor="factura-upload-edit" className="file-label">
                    {uploading ? '⏳ Subiendo...' : '📁 Selecciona o arrastra PDF'}
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)} disabled={uploading}>Cancelar</button>
              <button className="btn-save" onClick={handleSaveEditCompra} disabled={uploading}>💾 Guardar Cambios</button>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
                <th>Total</th>
                <th>Archivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map(m => (
                <tr key={m.CompraID}>
                  <td>{proveedores.find(p => p.ProveedorID === m.ProveedorID)?.Nombre || m.ProveedorID}</td>
                  <td>{new Date(m.Fecha).toLocaleDateString('es-MX')}</td>
                  <td className="monto">${m.TotalCompra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="archivo">
                    {m.FacturaRuta ? (
                      <button 
                        className="archivo-item"
                        onClick={() => openPDFViewer(m.FacturaRuta, m.FacturaRuta.split('/').pop())}
                        title="Ver PDF"
                      >
                        <span className="archivo-nombre">
                          {m.FacturaRuta.split('/').pop()}
                        </span>
                      </button>
                    ) : (
                      <span className="sin-archivo">—</span>
                    )}
                  </td>
                  <td className="acciones">
                    {m.FacturaRuta && (
                      <a href={getFullFileUrl(m.FacturaRuta)} download target="_blank" rel="noopener noreferrer" className="btn-download" title="Descargar Factura">📄</a>
                    )}
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
                <th>Archivo</th>
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
                  <td className="archivo">
                    {m.FacturaRuta ? (
                      <button 
                        className="archivo-item"
                        onClick={() => openPDFViewer(m.FacturaRuta, m.FacturaRuta.split('/').pop())}
                        title="Ver PDF"
                      >
                        <span className="archivo-nombre">
                          {m.FacturaRuta.split('/').pop()}
                        </span>
                      </button>
                    ) : (
                      <span className="sin-archivo">—</span>
                    )}
                  </td>
                  <td className="acciones">
                    <button className="btn-delete" onClick={() => handleDelete(m.RentaID, 'Maquinaria')} title="Eliminar">🗑️</button>
                    {m.FacturaRuta && (
                      <a href={getFullFileUrl(m.FacturaRuta)} download target="_blank" rel="noopener noreferrer" className="btn-download" title="Descargar Factura">📄</a>
                    )}
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
    <>
      {renderEditModal()}
      {renderPDFViewer()}
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
                      <XAxis dataKey="mesFormato" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                      <Legend />
                      <Bar 
                        dataKey="total" 
                        fill="#3498db" 
                        name="Gastos por Mes ($)"
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
                } else if (cat.key === 'Sueldos') {
                  count = (sueldosPagos || []).length;
                  total = (sueldosPagos || []).reduce((sum, s) => sum + (s.MontoPagado || 0), 0);
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
                      {(cat.key === 'Materiales' || cat.key === 'Maquinaria') && <span className="badge">{count}</span>}
                      {cat.key === 'Sueldos' && count > 0 && <span className="badge">{count}</span>}
                    </div>
                    {total > 0 && <span className="amount">${total.toLocaleString('es-MX')}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mostrar Lista de Sueldos O Tabla de Gastos */}
          {activeTab === 'Sueldos' ? (
            <SueldosListView selectedObra={selectedObra} onPagoGuardado={loadAllGastos} />
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
    </>
  );
}

export default GastosList;

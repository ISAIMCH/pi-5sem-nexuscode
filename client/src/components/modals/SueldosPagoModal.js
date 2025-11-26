import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/modals/SueldosPagoModal.css';

function SueldosPagoModal({ trabajador, obraID, onClose, onPagoGuardado }) {
  const [formData, setFormData] = useState({
    FechaPago: new Date().toISOString().split('T')[0],
    PeriodoInicio: '',
    PeriodoFin: '',
    MontoPagado: '',
    EstatusPago: 'Pagado',
    XMLRuta: null,
    FacturaRuta: null
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState({ type: '', text: '' });
  const [xmlFileName, setXmlFileName] = useState('');
  const [facturaFileName, setFacturaFileName] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validaciones de tipo de archivo
    if (fileType === 'xml') {
      // XML ahora también acepta PDF
      const isValidXML = file.name.endsWith('.xml') || file.type === 'application/xml' || file.type === 'text/xml';
      const isValidPDF = file.name.endsWith('.pdf') || file.type === 'application/pdf';
      
      if (!isValidXML && !isValidPDF) {
        setMensaje({ type: 'error', text: 'Por favor sube un archivo XML o PDF válido' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setMensaje({ type: 'error', text: 'El archivo no debe exceder 10MB' });
        return;
      }
    } else if (fileType === 'factura') {
      if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
        setMensaje({ type: 'error', text: 'Por favor sube un archivo PDF válido' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setMensaje({ type: 'error', text: 'El archivo PDF no debe exceder 10MB' });
        return;
      }
    }

    try {
      setUploading(true);
      
      console.log('Uploadando archivo:', { nombre: file.name, tipo: file.type, tamaño: file.size });

      let response;
      if (fileType === 'xml') {
        response = await api.uploadAPI.uploadXML(file);
        setFormData(prev => ({ ...prev, XMLRuta: response.filePath }));
        setXmlFileName(file.name);
        setMensaje({ type: 'success', text: '✅ Archivo subido correctamente' });
      } else if (fileType === 'factura') {
        response = await api.uploadAPI.uploadFactura(file);
        setFormData(prev => ({ ...prev, FacturaRuta: response.filePath }));
        setFacturaFileName(file.name);
        setMensaje({ type: 'success', text: '✅ Factura PDF subida correctamente' });
      }

      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', error.response?.data || error.message);
      setMensaje({ type: 'error', text: `Error al subir archivo: ${error.message || 'Error desconocido'}` });
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.FechaPago) {
      setMensaje({ type: 'error', text: 'La fecha de pago es requerida' });
      return false;
    }
    if (!formData.PeriodoInicio) {
      setMensaje({ type: 'error', text: 'La fecha de inicio del periodo es requerida' });
      return false;
    }
    if (!formData.PeriodoFin) {
      setMensaje({ type: 'error', text: 'La fecha de fin del periodo es requerida' });
      return false;
    }
    if (!formData.MontoPagado || parseFloat(formData.MontoPagado) <= 0) {
      setMensaje({ type: 'error', text: 'Ingresa un monto de pago válido' });
      return false;
    }
    if (new Date(formData.PeriodoFin) < new Date(formData.PeriodoInicio)) {
      setMensaje({ type: 'error', text: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' });
      return false;
    }
    return true;
  };

  const handleGuardarPago = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const pagoData = {
        ObraID: parseInt(obraID),
        TrabajadorID: trabajador.TrabajadorID,
        FechaPago: formData.FechaPago,
        PeriodoInicio: formData.PeriodoInicio,
        PeriodoFin: formData.PeriodoFin,
        MontoPagado: parseFloat(formData.MontoPagado),
        EstatusPago: formData.EstatusPago,
        XMLRuta: formData.XMLRuta || null,
        FacturaRuta: formData.FacturaRuta || null,
        Concepto: `Pago del periodo ${formData.PeriodoInicio} al ${formData.PeriodoFin}`
      };

      console.log('Enviando datos de pago:', pagoData);

      await api.nominaAPI?.create(pagoData);

      setMensaje({ type: 'success', text: '✅ Pago registrado correctamente' });
      setTimeout(() => {
        onPagoGuardado();
      }, 1500);
    } catch (error) {
      console.error('Error guardando pago:', error);
      setMensaje({ type: 'error', text: 'Error al guardar el pago: ' + (error.message || '') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-pago" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>💵 Registrar Pago</h2>
            <p className="trabajador-info">
              {trabajador.NombreCompleto}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {mensaje.text && (
            <div className={`mensaje ${mensaje.type}`}>
              {mensaje.text}
            </div>
          )}

          <div className="form-group">
            <label>📅 Fecha de Pago</label>
            <input
              type="date"
              value={formData.FechaPago}
              onChange={(e) => handleInputChange('FechaPago', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>📆 Período Inicio</label>
              <input
                type="date"
                value={formData.PeriodoInicio}
                onChange={(e) => handleInputChange('PeriodoInicio', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>📆 Período Fin</label>
              <input
                type="date"
                value={formData.PeriodoFin}
                onChange={(e) => handleInputChange('PeriodoFin', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-group">
            <label>💰 Cantidad del Pago</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.MontoPagado}
              onChange={(e) => handleInputChange('MontoPagado', e.target.value)}
              disabled={saving}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>⚙️ Estatus del Pago</label>
            <select
              value={formData.EstatusPago}
              onChange={(e) => handleInputChange('EstatusPago', e.target.value)}
              disabled={saving || true}
            >
              <option value="Pagado">✓ Pagado</option>
            </select>
          </div>

          {/* Sección de Documentos */}
          <div className="documentos-section">
            <h4>📄 Documentos Complementarios (Opcional)</h4>
            
            <div className="form-group">
              <label>🗂️ Archivo XML o PDF</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  accept=".xml,.pdf,application/xml,application/pdf"
                  onChange={(e) => handleFileUpload(e, 'xml')}
                  disabled={saving || uploading}
                  id="xml-input"
                  className="file-input"
                />
                <label htmlFor="xml-input" className="file-upload-label">
                  {uploading ? '📤 Subiendo...' : xmlFileName ? `✅ ${xmlFileName}` : '📁 Selecciona XML o PDF'}
                </label>
              </div>
              <small>Máximo 10MB, formatos .xml o .pdf</small>
            </div>

            <div className="form-group">
              <label>📋 Factura PDF</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'factura')}
                  disabled={saving || uploading}
                  id="factura-input"
                  className="file-input"
                />
                <label htmlFor="factura-input" className="file-upload-label">
                  {uploading ? '📤 Subiendo...' : facturaFileName ? `✅ ${facturaFileName}` : '📁 Selecciona PDF'}
                </label>
              </div>
              <small>Máximo 10MB, formato .pdf</small>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="btn-guardar"
            onClick={handleGuardarPago}
            disabled={saving}
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SueldosPagoModal;

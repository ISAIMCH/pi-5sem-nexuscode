import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/modals/SueldosPagoModal.css';

function SueldosPagoModal({ trabajador, obraID, onClose, onPagoGuardado }) {
  const [formData, setFormData] = useState({
    FechaPago: new Date().toISOString().split('T')[0],
    PeriodoInicio: '',
    PeriodoFin: '',
    EstatusPago: 'Pendiente'
  });

  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ type: '', text: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        EstatusPago: formData.EstatusPago,
        MontoPagado: 0, // Se calculará en backend si es necesario
        Concepto: `Pago del periodo ${formData.PeriodoInicio} al ${formData.PeriodoFin}`
      };

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
            <label>⚙️ Estatus del Pago</label>
            <select
              value={formData.EstatusPago}
              onChange={(e) => handleInputChange('EstatusPago', e.target.value)}
              disabled={saving}
            >
              <option value="Pendiente">⏳ Pendiente</option>
              <option value="Pagado">✓ Pagado</option>
            </select>
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

import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/modals/SueldosEditarPagoModal.css';

function SueldosEditarPagoModal({ pago, trabajador, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    FechaPago: pago.FechaPago ? new Date(pago.FechaPago).toISOString().split('T')[0] : '',
    PeriodoInicio: pago.PeriodoInicio ? new Date(pago.PeriodoInicio).toISOString().split('T')[0] : '',
    PeriodoFin: pago.PeriodoFin ? new Date(pago.PeriodoFin).toISOString().split('T')[0] : '',
    MontoPagado: pago.MontoPagado || '',
    EstatusPago: pago.EstatusPago || 'Pendiente',
    Concepto: pago.Concepto || '',
    Observaciones: pago.Observaciones || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a editar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FechaPago) {
      newErrors.FechaPago = 'Fecha de pago requerida';
    }

    if (!formData.PeriodoInicio) {
      newErrors.PeriodoInicio = 'Fecha de inicio del período requerida';
    }

    if (!formData.PeriodoFin) {
      newErrors.PeriodoFin = 'Fecha de fin del período requerida';
    }

    if (formData.PeriodoInicio && formData.PeriodoFin) {
      const inicio = new Date(formData.PeriodoInicio);
      const fin = new Date(formData.PeriodoFin);
      if (fin < inicio) {
        newErrors.PeriodoFin = 'La fecha final debe ser posterior a la inicial';
      }
    }

    if (!formData.MontoPagado || parseFloat(formData.MontoPagado) <= 0) {
      newErrors.MontoPagado = 'Cantidad debe ser mayor a 0';
    }

    if (!formData.EstatusPago) {
      newErrors.EstatusPago = 'Estatus es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const pagoActualizado = {
        ...formData,
        MontoPagado: parseFloat(formData.MontoPagado)
      };

      // Llamar a la API para actualizar
      const response = await api.nominaAPI.update(pago.NominaID, pagoActualizado);
      
      if (response && response.success) {
        onUpdate();
        onClose();
      } else {
        setErrors({ general: 'Error al actualizar el pago' });
      }
    } catch (error) {
      console.error('Error actualizando pago:', error);
      setErrors({ general: error.message || 'Error al actualizar el pago' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-editar-pago" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>✏️ Editar Pago</h2>
            <p className="trabajador-info">
              {trabajador.NombreCompleto}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="editar-pago-form">
            {/* Error general */}
            {errors.general && (
              <div className="form-error-general">
                <p>❌ {errors.general}</p>
              </div>
            )}

            {/* Fecha de Pago */}
            <div className="form-group">
              <label>📅 Fecha de Pago</label>
              <input
                type="date"
                name="FechaPago"
                value={formData.FechaPago}
                onChange={handleChange}
                className={errors.FechaPago ? 'input-error' : ''}
              />
              {errors.FechaPago && <span className="error-msg">{errors.FechaPago}</span>}
            </div>

            {/* Período Inicio */}
            <div className="form-group">
              <label>📆 Período Inicio</label>
              <input
                type="date"
                name="PeriodoInicio"
                value={formData.PeriodoInicio}
                onChange={handleChange}
                className={errors.PeriodoInicio ? 'input-error' : ''}
              />
              {errors.PeriodoInicio && <span className="error-msg">{errors.PeriodoInicio}</span>}
            </div>

            {/* Período Fin */}
            <div className="form-group">
              <label>📆 Período Fin</label>
              <input
                type="date"
                name="PeriodoFin"
                value={formData.PeriodoFin}
                onChange={handleChange}
                className={errors.PeriodoFin ? 'input-error' : ''}
              />
              {errors.PeriodoFin && <span className="error-msg">{errors.PeriodoFin}</span>}
            </div>

            {/* Cantidad del Pago */}
            <div className="form-group">
              <label>💰 Cantidad del Pago</label>
              <input
                type="number"
                name="MontoPagado"
                value={formData.MontoPagado}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.MontoPagado ? 'input-error' : ''}
              />
              {errors.MontoPagado && <span className="error-msg">{errors.MontoPagado}</span>}
            </div>

            {/* Estatus del Pago */}
            <div className="form-group">
              <label>⚙️ Estatus del Pago</label>
              <select
                name="EstatusPago"
                value={formData.EstatusPago}
                onChange={handleChange}
                className={errors.EstatusPago ? 'input-error' : ''}
              >
                <option value="">Seleccionar estatus</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
              {errors.EstatusPago && <span className="error-msg">{errors.EstatusPago}</span>}
            </div>

            {/* Concepto */}
            <div className="form-group">
              <label>📝 Concepto (Opcional)</label>
              <input
                type="text"
                name="Concepto"
                value={formData.Concepto}
                onChange={handleChange}
                placeholder="Ej: Sueldo quincenal"
              />
            </div>

            {/* Observaciones */}
            <div className="form-group">
              <label>💬 Observaciones (Opcional)</label>
              <textarea
                name="Observaciones"
                value={formData.Observaciones}
                onChange={handleChange}
                placeholder="Agregar notas si es necesario"
                rows="3"
              />
            </div>

            {/* Buttons */}
            <div className="form-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SueldosEditarPagoModal;

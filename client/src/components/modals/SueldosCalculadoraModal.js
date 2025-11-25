import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/modals/SueldosCalculadoraModal.css';

function SueldosCalculadoraModal({ trabajador, obraID, onClose, onPagoGuardado }) {
  const [raya, setRaya] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ type: '', text: '' });
  const [editingSueldo, setEditingSueldo] = useState(false);
  const [nuevoSueldo, setNuevoSueldo] = useState(0);

  const PRECIO_HORA_EXTRA = 75;

  useEffect(() => {
    if (trabajador) {
      initializeRaya();
    }
  }, [trabajador]);

  const initializeRaya = () => {
    setRaya({
      TrabajadorID: trabajador.TrabajadorID,
      NombreCompleto: trabajador.NombreCompleto,
      Puesto: trabajador.Puesto,
      SueldoDiario: trabajador.SueldoDiario || 0,
      DiasTrabajados: 6,
      HorasExtra: 0,
      Deducciones: 0,
      totalAPagar: 0,
      FechaPago: new Date().toISOString().split('T')[0]
    });
    setNuevoSueldo(trabajador.SueldoDiario || 0);
  };

  const calcularTotal = (dias, sueldo, horas, deducciones) => {
    const sueldoPorDias = dias * sueldo;
    const pagoHorasExtra = horas * PRECIO_HORA_EXTRA;
    const totalAPagar = sueldoPorDias + pagoHorasExtra - deducciones;
    return Math.max(0, totalAPagar);
  };

  const handleInputChange = (field, value) => {
    if (!raya) return;

    const updatedRaya = { ...raya, [field]: parseFloat(value) || 0 };

    if (['DiasTrabajados', 'HorasExtra', 'Deducciones'].includes(field)) {
      updatedRaya.totalAPagar = calcularTotal(
        updatedRaya.DiasTrabajados,
        updatedRaya.SueldoDiario,
        updatedRaya.HorasExtra,
        updatedRaya.Deducciones
      );
    }

    setRaya(updatedRaya);
  };

  const handleGuardarSueldo = async () => {
    try {
      setSaving(true);
      const result = await api.trabajadoresAPI?.update(trabajador.TrabajadorID, {
        SueldoDiario: parseFloat(nuevoSueldo)
      });

      const updatedRaya = {
        ...raya,
        SueldoDiario: parseFloat(nuevoSueldo)
      };
      setRaya(updatedRaya);
      setEditingSueldo(false);
      setMensaje({ type: 'success', text: '✅ Sueldo diario actualizado' });
      setTimeout(() => setMensaje({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Error actualizando sueldo:', error);
      const errorMsg = error?.message || 'Error desconocido';
      setMensaje({ type: 'error', text: `Error al actualizar sueldo: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarPago = async () => {
    if (!raya) {
      setMensaje({ type: 'error', text: 'No hay datos para guardar' });
      return;
    }

    try {
      setSaving(true);

      const pagoData = {
        ObraID: parseInt(obraID),
        TrabajadorID: raya.TrabajadorID,
        FechaPago: raya.FechaPago,
        MontoPagado: raya.totalAPagar,
        DiasPagados: raya.DiasTrabajados,
        Observaciones: `${raya.DiasTrabajados} días, ${raya.HorasExtra}h extra, Deducción: $${raya.Deducciones.toFixed(2)}`
      };

      await api.nominaAPI?.create(pagoData);

      setMensaje({ type: 'success', text: '✅ Pago guardado correctamente' });
      setTimeout(() => {
        onPagoGuardado();
      }, 1500);
    } catch (error) {
      console.error('Error guardando pago:', error);
      setMensaje({ type: 'error', text: 'Error al guardar el pago' });
    } finally {
      setSaving(false);
    }
  };

  if (!raya) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-calculadora" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>💳 Registrar Pago</h2>
            <p className="trabajador-info">
              {raya.NombreCompleto} • <span className="puesto">{raya.Puesto}</span>
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Mensaje */}
          {mensaje.text && (
            <div className={`modal-mensaje ${mensaje.type}`}>
              {mensaje.text}
            </div>
          )}

          {/* Sueldo Diario Editable */}
          <div className="section-sueldo">
            <h3>💰 Sueldo Diario</h3>
            <div className="sueldo-display">
              <span className="sueldo-amount">${raya.SueldoDiario.toFixed(2)}</span>
              <button
                className="btn-edit-small"
                onClick={() => {
                  setEditingSueldo(!editingSueldo);
                  setNuevoSueldo(raya.SueldoDiario);
                }}
              >
                ✏️ Editar
              </button>
            </div>

            {editingSueldo && (
              <div className="sueldo-edit-inline">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoSueldo}
                  onChange={(e) => setNuevoSueldo(e.target.value)}
                  className="input-sueldo"
                  placeholder="Nuevo sueldo diario"
                />
                <button
                  className="btn-save-small"
                  onClick={handleGuardarSueldo}
                  disabled={saving}
                >
                  Guardar
                </button>
                <button
                  className="btn-cancel-small"
                  onClick={() => setEditingSueldo(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Fecha de Pago */}
          <div className="section-fecha">
            <h3>📅 Fecha de Pago</h3>
            <input
              type="date"
              value={raya.FechaPago}
              onChange={(e) => handleInputChange('FechaPago', e.target.value)}
              className="input-fecha"
            />
          </div>

          {/* Detalles de Cálculo */}
          <div className="section-detalles">
            <h3>📊 Detalles del Cálculo</h3>

            <div className="detail-group">
              <label>Días Trabajados:</label>
              <div className="detail-input-row">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={raya.DiasTrabajados}
                  onChange={(e) => handleInputChange('DiasTrabajados', e.target.value)}
                  className="input-detail"
                />
                <span className="calc-display">
                  × ${raya.SueldoDiario.toFixed(2)} = ${(raya.DiasTrabajados * raya.SueldoDiario).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="detail-group">
              <label>Horas Extra:</label>
              <div className="detail-input-row">
                <input
                  type="number"
                  min="0"
                  value={raya.HorasExtra}
                  onChange={(e) => handleInputChange('HorasExtra', e.target.value)}
                  className="input-detail"
                />
                <span className="calc-display">
                  × $75 = ${(raya.HorasExtra * PRECIO_HORA_EXTRA).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="detail-group">
              <label>Deducciones:</label>
              <div className="detail-input-row">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={raya.Deducciones}
                  onChange={(e) => handleInputChange('Deducciones', e.target.value)}
                  className="input-detail"
                />
                <span className="calc-display">= -${raya.Deducciones.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="detail-total">
              <span className="label">Total a Pagar:</span>
              <span className="amount">${raya.totalAPagar.toFixed(2)}</span>
            </div>

            {/* Fórmula */}
            <div className="formula-display">
              <p>
                ({raya.DiasTrabajados.toFixed(0)} × ${raya.SueldoDiario.toFixed(2)}) + 
                ({raya.HorasExtra.toFixed(0)} × $75) - ${raya.Deducciones.toFixed(2)} = 
                <strong> ${raya.totalAPagar.toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel-modal" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn-guardar-pago"
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

export default SueldosCalculadoraModal;

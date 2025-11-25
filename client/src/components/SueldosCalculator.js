import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/SueldosCalculator.css';

function SueldosCalculator({ selectedObra }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [selectedTrabajador, setSelectedTrabajador] = useState(null);
  const [raya, setRaya] = useState(null);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingSueldo, setEditingSueldo] = useState(false);
  const [nuevoSueldo, setNuevoSueldo] = useState(0);
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);

  const PRECIO_HORA_EXTRA = 75; // Precio por hora extra

  useEffect(() => {
    if (selectedObra) {
      loadTrabajadoresByObra();
    }
  }, [selectedObra]);

  useEffect(() => {
    if (selectedTrabajador) {
      initializeRaya();
      loadHistorialPagos();
    }
  }, [selectedTrabajador]);

  const loadTrabajadoresByObra = async () => {
    try {
      setLoading(true);
      const allTrabajadores = await api.trabajadoresAPI?.getAll();
      const filtered = allTrabajadores?.filter(t => t.ObraActualID === parseInt(selectedObra)) || [];
      setTrabajadores(filtered);
      setSelectedTrabajador(null);
      setRaya(null);
      setHistorialPagos([]);
    } catch (error) {
      console.error('Error loading trabajadores:', error);
      setMessage({ type: 'error', text: 'Error al cargar trabajadores' });
    } finally {
      setLoading(false);
    }
  };

  const initializeRaya = () => {
    if (selectedTrabajador) {
      setRaya({
        TrabajadorID: selectedTrabajador.TrabajadorID,
        NombreCompleto: selectedTrabajador.NombreCompleto,
        Puesto: selectedTrabajador.Puesto,
        SueldoDiario: selectedTrabajador.SueldoDiario || 0,
        DiasTrabajados: 6,
        HorasExtra: 0,
        Deducciones: 0,
        totalAPagar: 0,
        FechaPago: fechaPago
      });
      setNuevoSueldo(selectedTrabajador.SueldoDiario || 0);
    }
  };

  const loadHistorialPagos = async () => {
    try {
      if (!selectedTrabajador) return;
      
      const allPagos = await api.nominaAPI?.getByObra(selectedObra);
      const filtered = allPagos?.filter(p => p.TrabajadorID === selectedTrabajador.TrabajadorID) || [];
      setHistorialPagos(filtered.sort((a, b) => new Date(b.FechaPago) - new Date(a.FechaPago)));
    } catch (error) {
      console.error('Error loading historial:', error);
      setHistorialPagos([]);
    }
  };

  // Calcular total a pagar en tiempo real
  const calcularTotal = (dias, sueldo, horas, deducciones) => {
    const sueldoPorDias = dias * sueldo;
    const pagoHorasExtra = horas * PRECIO_HORA_EXTRA;
    const totalAPagar = sueldoPorDias + pagoHorasExtra - deducciones;
    return Math.max(0, totalAPagar);
  };

  // Actualizar un campo específico de la raya
  const handleInputChange = (field, value) => {
    if (!raya) return;
    
    const updatedRaya = { ...raya, [field]: parseFloat(value) || 0 };
    
    // Recalcular total si es necesario
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

  // Actualizar sueldo diario
  const handleGuardarSueldo = async () => {
    try {
      setSaving(true);
      await api.trabajadoresAPI?.update(selectedTrabajador.TrabajadorID, {
        SueldoDiario: parseFloat(nuevoSueldo)
      });
      
      // Actualizar estado local
      const updatedTrabajadores = trabajadores.map(t =>
        t.TrabajadorID === selectedTrabajador.TrabajadorID
          ? { ...t, SueldoDiario: parseFloat(nuevoSueldo) }
          : t
      );
      setTrabajadores(updatedTrabajadores);
      
      const updatedSelected = {
        ...selectedTrabajador,
        SueldoDiario: parseFloat(nuevoSueldo)
      };
      setSelectedTrabajador(updatedSelected);
      
      initializeRaya();
      setEditingSueldo(false);
      setMessage({ type: 'success', text: '✅ Sueldo diario actualizado' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Error updating sueldo:', error);
      setMessage({ type: 'error', text: 'Error al actualizar sueldo: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  // Guardar pago individual
  const handleGuardarPago = async () => {
    if (!raya) {
      setMessage({ type: 'error', text: 'No hay datos para guardar' });
      return;
    }

    try {
      setSaving(true);
      
      const pagoData = {
        ObraID: parseInt(selectedObra),
        TrabajadorID: raya.TrabajadorID,
        FechaPago: raya.FechaPago,
        MontoPagado: raya.totalAPagar,
        DiasPagados: raya.DiasTrabajados,
        Observaciones: `Raya: ${raya.DiasTrabajados} días, ${raya.HorasExtra}h extra, Deducción: $${raya.Deducciones}`
      };

      await api.nominaAPI?.create(pagoData);

      setMessage({ type: 'success', text: '✅ Pago guardado correctamente' });
      
      // Recargar historial
      await loadHistorialPagos();
      
      // Resetear calculadora
      initializeRaya();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Error saving pago:', error);
      setMessage({ type: 'error', text: 'Error al guardar pago: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="sueldo-loading">Cargando trabajadores...</div>;
  }

  return (
    <div className="sueldo-calculator-container">
      {/* Mensaje */}
      {message.text && (
        <div className={`sueldo-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Selector de Trabajador */}
      <div className="trabajador-selector-section">
        <h3>👷 Selecciona un Trabajador</h3>
        <div className="trabajadores-grid">
          {trabajadores.length === 0 ? (
            <p className="no-trabajadores">📭 No hay trabajadores asignados a esta obra</p>
          ) : (
            trabajadores.map(trab => (
              <button
                key={trab.TrabajadorID}
                className={`trabajador-card ${selectedTrabajador?.TrabajadorID === trab.TrabajadorID ? 'active' : ''}`}
                onClick={() => setSelectedTrabajador(trab)}
              >
                <div className="card-content">
                  <h4>{trab.NombreCompleto}</h4>
                  <p className="puesto">{trab.Puesto}</p>
                  <p className="sueldo">💰 ${trab.SueldoDiario?.toFixed(2) || '0.00'}/día</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Calculadora Individual */}
      {selectedTrabajador && raya && (
        <div className="calculadora-individual">
          <div className="calc-header">
            <h2>📋 Calculadora de Nómina - {raya.NombreCompleto}</h2>
            <p>{raya.Puesto}</p>
          </div>

          {/* Sección Sueldo Diario Editable */}
          <div className="sueldo-editable-section">
            <div className="sueldo-display">
              <label>Sueldo Diario:</label>
              <div className="sueldo-value">
                <span className="amount">${raya.SueldoDiario.toFixed(2)}</span>
                <button
                  className="btn-edit-sueldo"
                  onClick={() => {
                    setEditingSueldo(!editingSueldo);
                    setNuevoSueldo(raya.SueldoDiario);
                  }}
                >
                  ✏️ Editar
                </button>
              </div>
            </div>

            {editingSueldo && (
              <div className="sueldo-edit-form">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoSueldo}
                  onChange={(e) => setNuevoSueldo(e.target.value)}
                  className="sueldo-input"
                  placeholder="Nuevo sueldo diario"
                />
                <button
                  className="btn-save-sueldo"
                  onClick={handleGuardarSueldo}
                  disabled={saving}
                >
                  {saving ? '💾 Guardando...' : '💾 Guardar Sueldo'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setEditingSueldo(false)}
                  disabled={saving}
                >
                  ✕ Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Fecha de Pago */}
          <div className="fecha-pago-section">
            <label>📅 Fecha de Pago:</label>
            <input
              type="date"
              value={raya.FechaPago}
              onChange={(e) => handleInputChange('FechaPago', e.target.value)}
              className="fecha-input"
            />
          </div>

          {/* Tabla de Detalles */}
          <div className="raya-detail-table">
            <div className="detail-row">
              <span className="label">Días Trabajados:</span>
              <div className="input-wrapper">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={raya.DiasTrabajados}
                  onChange={(e) => handleInputChange('DiasTrabajados', e.target.value)}
                  className="input-number"
                />
                <span className="calc">× ${raya.SueldoDiario.toFixed(2)} = ${(raya.DiasTrabajados * raya.SueldoDiario).toFixed(2)}</span>
              </div>
            </div>

            <div className="detail-row">
              <span className="label">Horas Extra:</span>
              <div className="input-wrapper">
                <input
                  type="number"
                  min="0"
                  value={raya.HorasExtra}
                  onChange={(e) => handleInputChange('HorasExtra', e.target.value)}
                  className="input-number"
                />
                <span className="calc">× $75 = ${(raya.HorasExtra * PRECIO_HORA_EXTRA).toFixed(2)}</span>
              </div>
            </div>

            <div className="detail-row">
              <span className="label">Deducciones:</span>
              <div className="input-wrapper">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={raya.Deducciones}
                  onChange={(e) => handleInputChange('Deducciones', e.target.value)}
                  className="input-number"
                />
                <span className="calc">= -$${raya.Deducciones.toFixed(2)}</span>
              </div>
            </div>

            <div className="detail-row total">
              <span className="label">💵 Total a Pagar:</span>
              <span className="total-amount">${raya.totalAPagar.toFixed(2)}</span>
            </div>
          </div>

          {/* Información de Fórmula */}
          <div className="calc-info">
            <p><strong>Fórmula:</strong> (Días × $Diario) + (Horas × $75) - Deducciones</p>
            <p><strong>Resultando:</strong> (${(raya.DiasTrabajados * raya.SueldoDiario).toFixed(2)}) + (${(raya.HorasExtra * 75).toFixed(2)}) - ${raya.Deducciones.toFixed(2)} = <strong>${raya.totalAPagar.toFixed(2)}</strong></p>
          </div>

          {/* Botón Guardar Pago */}
          <button
            className="btn-guardar-pago"
            onClick={handleGuardarPago}
            disabled={saving}
          >
            {saving ? '💾 Guardando...' : '💾 Guardar Pago'}
          </button>
        </div>
      )}

      {/* Historial de Pagos */}
      {selectedTrabajador && (
        <div className="historial-pagos-section">
          <h2>📊 Historial de Pagos - {selectedTrabajador.NombreCompleto}</h2>
          
          {historialPagos.length === 0 ? (
            <p className="no-historial">No hay pagos registrados para este trabajador</p>
          ) : (
            <div className="historial-table-responsive">
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Fecha de Pago</th>
                    <th>Días Pagados</th>
                    <th>Monto</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {historialPagos.map((pago, index) => (
                    <tr key={index}>
                      <td className="fecha">
                        {new Date(pago.FechaPago).toLocaleDateString('es-MX')}
                      </td>
                      <td className="dias">
                        {pago.DiasPagados || '—'}
                      </td>
                      <td className="monto">
                        ${pago.MontoPagado?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                      </td>
                      <td className="observaciones">
                        {pago.Observaciones || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totales */}
          {historialPagos.length > 0 && (
            <div className="historial-totales">
              <div className="total-card">
                <span className="label">Pagos Realizados:</span>
                <span className="value">{historialPagos.length}</span>
              </div>
              <div className="total-card">
                <span className="label">Total Pagado:</span>
                <span className="value">${historialPagos.reduce((sum, p) => sum + (p.MontoPagado || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="total-card">
                <span className="label">Promedio por Pago:</span>
                <span className="value">${(historialPagos.reduce((sum, p) => sum + (p.MontoPagado || 0), 0) / historialPagos.length).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SueldosCalculator;


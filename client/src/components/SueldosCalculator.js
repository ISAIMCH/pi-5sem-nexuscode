import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/SueldosCalculator.css';

function SueldosCalculator({ selectedObra }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [raya, setRaya] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const PRECIO_HORA_EXTRA = 75; // Precio por hora extra

  useEffect(() => {
    if (selectedObra) {
      loadTrabajadoresByObra();
    }
  }, [selectedObra]);

  const loadTrabajadoresByObra = async () => {
    try {
      setLoading(true);
      // Obtener trabajadores que están asignados a esta obra
      const allTrabajadores = await api.trabajadoresAPI?.getAll();
      const filtered = allTrabajadores?.filter(t => t.ObraActualID === parseInt(selectedObra)) || [];
      
      setTrabajadores(filtered);
      
      // Inicializar la raya con valores por defecto
      const rayaInitial = filtered.map(t => ({
        TrabajadorID: t.TrabajadorID,
        NombreCompleto: t.NombreCompleto,
        Puesto: t.Puesto,
        SueldoDiario: t.SueldoDiario || 0,
        DiasTrabajados: 6,
        HorasExtra: 0,
        Deducciones: 0,
        totalAPagar: 0
      }));
      
      setRaya(rayaInitial);
    } catch (error) {
      console.error('Error loading trabajadores:', error);
      setMessage({ type: 'error', text: 'Error al cargar trabajadores' });
    } finally {
      setLoading(false);
    }
  };

  // Calcular total a pagar en tiempo real
  const calcularTotal = (dias, sueldo, horas, deducciones) => {
    const sueldoPorDias = dias * sueldo;
    const pagoHorasExtra = horas * PRECIO_HORA_EXTRA;
    const totalAPagar = sueldoPorDias + pagoHorasExtra - deducciones;
    return Math.max(0, totalAPagar); // No permitir negativos
  };

  // Actualizar un campo específico de la raya
  const handleInputChange = (index, field, value) => {
    const updatedRaya = [...raya];
    updatedRaya[index] = { ...updatedRaya[index], [field]: parseFloat(value) || 0 };
    
    // Recalcular total si es necesario
    if (['DiasTrabajados', 'HorasExtra', 'Deducciones'].includes(field)) {
      updatedRaya[index].totalAPagar = calcularTotal(
        updatedRaya[index].DiasTrabajados,
        updatedRaya[index].SueldoDiario,
        updatedRaya[index].HorasExtra,
        updatedRaya[index].Deducciones
      );
    }
    
    setRaya(updatedRaya);
  };

  // Guardar nómina semanal
  const handleGuardarNomina = async () => {
    if (raya.length === 0) {
      setMessage({ type: 'error', text: 'No hay trabajadores para guardar' });
      return;
    }

    try {
      setSaving(true);
      
      // Preparar los datos para enviar al backend
      const pagoNominaData = raya.map(r => ({
        ObraID: parseInt(selectedObra),
        TrabajadorID: r.TrabajadorID,
        FechaPago: new Date().toISOString().split('T')[0],
        MontoPagado: r.totalAPagar,
        DiasPagados: r.DiasTrabajados,
        Observaciones: `Raya: ${r.DiasTrabajados} días, ${r.HorasExtra}h extra, Deducción: $${r.Deducciones}`
      }));

      // Enviar cada pago al backend
      for (const pago of pagoNominaData) {
        await api.nominaAPI?.create(pago);
      }

      setMessage({ type: 'success', text: '✅ Nómina guardada correctamente' });
      
      // Limpiar la raya después de guardar
      setTimeout(() => {
        loadTrabajadoresByObra();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      console.error('Error saving nomina:', error);
      setMessage({ type: 'error', text: 'Error al guardar nómina: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="sueldo-loading">Cargando trabajadores...</div>;
  }

  if (trabajadores.length === 0) {
    return (
      <div className="sueldo-empty">
        <p>📭 No hay trabajadores asignados a esta obra</p>
        <small>Asigna trabajadores en el módulo Trabajadores primero</small>
      </div>
    );
  }

  const totalNomina = raya.reduce((sum, r) => sum + r.totalAPagar, 0);

  return (
    <div className="sueldo-calculator">
      {/* Header */}
      <div className="sueldo-header">
        <h2>📋 Calculadora de Nómina Semanal</h2>
        <p>Captura de raya para trabajadores de esta obra</p>
      </div>

      {/* Mensaje */}
      {message.text && (
        <div className={`sueldo-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabla de Captura de Raya */}
      <div className="raya-container">
        <table className="raya-table">
          <thead>
            <tr>
              <th>Trabajador</th>
              <th>Puesto</th>
              <th>Sueldo Diario</th>
              <th>Días Trab.</th>
              <th>Hrs Extra</th>
              <th>Deducciones ($)</th>
              <th>Total a Pagar</th>
            </tr>
          </thead>
          <tbody>
            {raya.map((r, index) => (
              <tr key={r.TrabajadorID} className="raya-row">
                <td className="nombre">{r.NombreCompleto}</td>
                <td className="puesto">{r.Puesto}</td>
                <td className="sueldo">
                  ${r.SueldoDiario.toFixed(2)}
                </td>
                <td className="input-cell">
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={r.DiasTrabajados}
                    onChange={(e) => handleInputChange(index, 'DiasTrabajados', e.target.value)}
                    className="input-number"
                  />
                </td>
                <td className="input-cell">
                  <input
                    type="number"
                    min="0"
                    value={r.HorasExtra}
                    onChange={(e) => handleInputChange(index, 'HorasExtra', e.target.value)}
                    className="input-number"
                  />
                </td>
                <td className="input-cell">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={r.Deducciones}
                    onChange={(e) => handleInputChange(index, 'Deducciones', e.target.value)}
                    className="input-number"
                    placeholder="0.00"
                  />
                </td>
                <td className="total">
                  ${r.totalAPagar.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen y Botón de Guardar */}
      <div className="sueldo-footer">
        <div className="sueldo-summary">
          <div className="summary-card">
            <span className="label">Trabajadores:</span>
            <span className="value">{raya.length}</span>
          </div>
          <div className="summary-card total-card">
            <span className="label">Total Nómina Semanal:</span>
            <span className="value">${totalNomina.toFixed(2)}</span>
          </div>
        </div>

        <button
          className="btn-guardar-nomina"
          onClick={handleGuardarNomina}
          disabled={saving || raya.length === 0}
        >
          {saving ? '💾 Guardando...' : '💾 Guardar Nómina Semanal'}
        </button>
      </div>

      {/* Información adicional */}
      <div className="sueldo-info">
        <p><strong>Precio Hora Extra:</strong> ${PRECIO_HORA_EXTRA}/hora</p>
        <p><strong>Fórmula:</strong> (Días × Sueldo Diario) + (Horas × ${PRECIO_HORA_EXTRA}) - Deducciones</p>
      </div>
    </div>
  );
}

export default SueldosCalculator;

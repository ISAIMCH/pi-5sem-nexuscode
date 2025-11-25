import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/modals/SueldosHistorialModal.css';

function SueldosHistorialModal({ trabajador, obraID, onClose }) {
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistorial();
  }, [trabajador]);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      const allPagos = await api.nominaAPI?.getByObra(obraID) || [];
      const filtered = allPagos.filter(p => p.TrabajadorID === trabajador.TrabajadorID);
      setHistorialPagos(filtered.sort((a, b) => new Date(b.FechaPago) - new Date(a.FechaPago)));
    } catch (error) {
      console.error('Error cargando historial:', error);
      setHistorialPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    if (historialPagos.length === 0) return { count: 0, total: 0, promedio: 0 };

    const total = historialPagos.reduce((sum, p) => sum + (p.MontoPagado || 0), 0);
    return {
      count: historialPagos.length,
      total: total,
      promedio: total / historialPagos.length
    };
  };

  const totales = calcularTotales();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-historial" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>📋 Historial de Pagos</h2>
            <p className="trabajador-info">
              {trabajador.NombreCompleto} • <span className="puesto">{trabajador.Puesto}</span>
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div className="historial-loading">
              <p>🔄 Cargando historial...</p>
            </div>
          ) : historialPagos.length === 0 ? (
            <div className="historial-empty">
              <p>📭 No hay pagos registrados para este trabajador</p>
            </div>
          ) : (
            <>
              {/* Tabla */}
              <div className="historial-table-responsive">
                <table className="historial-table">
                  <thead>
                    <tr>
                      <th>Fecha de Pago</th>
                      <th>Días Trabajados</th>
                      <th>Monto Pagado</th>
                      <th>Horas Extra</th>
                      <th>Días Pagados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPagos.map((pago, index) => {
                      // Extraer información del campo Observaciones
                      const obs = pago.Observaciones || '';
                      const horasMatch = obs.match(/(\d+)h extra/);
                      const horasExtra = horasMatch ? horasMatch[1] : '—';

                      return (
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
                          <td className="horas">
                            {horasExtra}h
                          </td>
                          <td className="dias-pagados">
                            {pago.DiasPagados || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="historial-summary">
                <div className="summary-card">
                  <span className="label">Total de Pagos</span>
                  <span className="value">{totales.count}</span>
                </div>
                <div className="summary-card highlight">
                  <span className="label">Monto Total Pagado</span>
                  <span className="value">${totales.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="summary-card">
                  <span className="label">Promedio por Pago</span>
                  <span className="value">${totales.promedio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SueldosHistorialModal;

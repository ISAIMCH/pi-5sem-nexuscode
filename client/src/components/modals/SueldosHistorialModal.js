import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SueldosEditarPagoModal from './SueldosEditarPagoModal';
import '../../styles/modals/SueldosHistorialModal.css';

function SueldosHistorialModal({ trabajador, obraID, onClose }) {
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagoEditando, setPagoEditando] = useState(null);

  useEffect(() => {
    loadHistorial();
  }, [trabajador]);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      // Cargar todos los pagos de todos los trabajadores de esta obra
      const allPagos = await api.nominaAPI?.getByObra(obraID) || [];
      // Filtrar solo los del trabajador actual
      const filtered = allPagos.filter(p => parseInt(p.TrabajadorID) === parseInt(trabajador.TrabajadorID));
      setHistorialPagos(filtered.sort((a, b) => new Date(b.FechaPago) - new Date(a.FechaPago)));
    } catch (error) {
      console.error('Error cargando historial:', error);
      setHistorialPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    if (historialPagos.length === 0) return { count: 0, total: 0, pagados: 0, pendientes: 0 };

    const total = historialPagos.reduce((sum, p) => sum + (p.MontoPagado || 0), 0);
    const pagados = historialPagos.filter(p => p.EstatusPago === 'Pagado').length;
    const pendientes = historialPagos.filter(p => p.EstatusPago === 'Pendiente').length;

    return {
      count: historialPagos.length,
      total: total,
      pagados: pagados,
      pendientes: pendientes
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const formatMonto = (monto) => {
    return (monto || 0).toLocaleString('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 2 
    });
  };

  const getEstatusClass = (status) => {
    return status === 'Pagado' ? 'pagado' : 'pendiente';
  };

  const handleDescargar = (rutaArchivo, nombreArchivo) => {
    if (!rutaArchivo) return;
    const link = document.createElement('a');
    link.href = rutaArchivo;
    link.download = nombreArchivo || 'documento';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDocumentoCell = (ruta, tipo) => {
    if (!ruta) {
      return <span className="sin-archivo">Sin archivo</span>;
    }
    return (
      <button
        className="btn-descargar-documento"
        onClick={() => handleDescargar(ruta, `documento_${tipo}`)}
        title={`Descargar ${tipo}`}
      >
        📥 Descargar
      </button>
    );
  };

  const totales = calcularTotales();

  const handleEditarClick = (pago) => {
    setPagoEditando(pago);
  };

  const handleCloseEditar = () => {
    setPagoEditando(null);
  };

  const handleUpdatePago = () => {
    loadHistorial();
  };

  // Si hay modal de edición abierto, mostrar ese en su lugar
  if (pagoEditando) {
    return (
      <SueldosEditarPagoModal
        pago={pagoEditando}
        trabajador={trabajador}
        onClose={handleCloseEditar}
        onUpdate={handleUpdatePago}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-historial" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>📋 Historial de Pagos</h2>
            <p className="trabajador-info">
              {trabajador.NombreCompleto}
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
              {/* Tabla completa de pagos */}
              <div className="historial-table-responsive">
                <table className="historial-table">
                  <thead>
                    <tr>
                      <th>Fecha de Pago</th>
                      <th>Período Inicio</th>
                      <th>Período Fin</th>
                      <th>Monto Pagado</th>
                      <th>XML</th>
                      <th>Factura</th>
                      <th>Concepto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPagos.map((pago, index) => (
                      <tr key={index}>
                        <td className="fecha">
                          {formatDate(pago.FechaPago)}
                        </td>
                        <td className="periodo">
                          {formatDate(pago.PeriodoInicio)}
                        </td>
                        <td className="periodo">
                          {formatDate(pago.PeriodoFin)}
                        </td>
                        <td className="monto">
                          {formatMonto(pago.MontoPagado)}
                        </td>
                        <td className="documento">
                          {renderDocumentoCell(pago.XMLRuta, 'XML')}
                        </td>
                        <td className="documento">
                          {renderDocumentoCell(pago.FacturaRuta, 'Factura')}
                        </td>
                        <td className="concepto">
                          {pago.Concepto || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="historial-summary">
                <div className="summary-card">
                  <span className="label">📊 Total de Pagos</span>
                  <span className="value">{totales.count}</span>
                </div>
                <div className="summary-card highlight">
                  <span className="label">💰 Monto Total</span>
                  <span className="value">{formatMonto(totales.total)}</span>
                </div>
                <div className="summary-card success">
                  <span className="label">✓ Pagados</span>
                  <span className="value">{totales.pagados}</span>
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

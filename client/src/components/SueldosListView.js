import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SueldosPagoModal from './modals/SueldosPagoModal';
import SueldosHistorialModal from './modals/SueldosHistorialModal';
import '../styles/SueldosListView.css';

function SueldosListView({ selectedObra }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ type: '', text: '' });
  
  // Modales
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedTrabajador, setSelectedTrabajador] = useState(null);

  useEffect(() => {
    if (selectedObra) {
      loadTrabajadores();
      
      // Recargar trabajadores cada 5 segundos SOLO si no hay modales abiertos
      // Esto evita que los modales parpadeen al cerrarse
      const interval = setInterval(() => {
        if (!showPagoModal && !showHistorialModal) {
          loadTrabajadores();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedObra, showPagoModal, showHistorialModal]);

  const loadTrabajadores = async () => {
    try {
      setLoading(true);
      const allTrabajadores = await api.trabajadoresAPI?.getAll() || [];
      const filtered = allTrabajadores.filter(t => t.ObraActualID === parseInt(selectedObra));
      setTrabajadores(filtered);
    } catch (error) {
      console.error('Error al cargar trabajadores:', error);
      setMensaje({ type: 'error', text: 'Error al cargar trabajadores' });
      setTimeout(() => setMensaje({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirPago = (trabajador) => {
    setSelectedTrabajador(trabajador);
    setShowPagoModal(true);
  };

  const handleAbrirHistorial = (trabajador) => {
    setSelectedTrabajador(trabajador);
    setShowHistorialModal(true);
  };

  const handleCerrarModal = () => {
    setShowPagoModal(false);
    setShowHistorialModal(false);
    setSelectedTrabajador(null);
  };

  const handlePagoGuardado = async () => {
    setMensaje({ type: 'success', text: '✅ Pago guardado correctamente' });
    handleCerrarModal();
    // Recargar trabajadores solo después de guardar un pago (no en cada cierre)
    await loadTrabajadores();
  };

  if (loading) {
    return (
      <div className="sueldos-list-container">
        <div className="sueldos-loading">
          <p>🔄 Cargando trabajadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sueldos-list-container">
      {/* Mensaje de notificación */}
      {mensaje.text && (
        <div className={`sueldos-mensaje ${mensaje.type}`}>
          {mensaje.text}
        </div>
      )}

      {/* Header */}
      <div className="sueldos-list-header">
        <h3>👷 Trabajadores de la Obra</h3>
        <p>{trabajadores.length} trabajador{trabajadores.length !== 1 ? 'es' : ''} asignado{trabajadores.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Lista de Trabajadores */}
      {trabajadores.length === 0 ? (
        <div className="sueldos-empty-state">
          <p>📭 No hay trabajadores asignados a esta obra</p>
        </div>
      ) : (
        <div className="sueldos-trabajadores-grid">
          {trabajadores.map(trabajador => (
            <div key={trabajador.TrabajadorID} className="sueldos-trabajador-card">
              <div className="card-header">
                <h4>{trabajador.NombreCompleto}</h4>
                <p className="puesto-badge">{trabajador.Puesto}</p>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">💰 Sueldo Diario:</span>
                  <span className="value">${trabajador.SueldoDiario?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="btn-pago"
                  onClick={() => handleAbrirPago(trabajador)}
                  title="Registrar nuevo pago"
                >
                  💵 Pago
                </button>
                <button
                  className="btn-historial"
                  onClick={() => handleAbrirHistorial(trabajador)}
                  title="Ver historial de pagos"
                >
                  📋 Historial
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Pago */}
      {showPagoModal && selectedTrabajador && (
        <SueldosPagoModal
          trabajador={selectedTrabajador}
          obraID={selectedObra}
          onClose={handleCerrarModal}
          onPagoGuardado={handlePagoGuardado}
        />
      )}

      {/* Modal: Historial de Pagos */}
      {showHistorialModal && selectedTrabajador && (
        <SueldosHistorialModal
          trabajador={selectedTrabajador}
          obraID={selectedObra}
          onClose={handleCerrarModal}
        />
      )}
    </div>
  );
}

export default SueldosListView;

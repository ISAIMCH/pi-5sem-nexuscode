import React from 'react';
import '../styles/DetailModal.css';

const DetailModal = ({ isOpen, trabajador, onClose }) => {
  if (!isOpen || !trabajador) return null;

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-MX');
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-container" onClick={e => e.stopPropagation()}>
        <div className="detail-modal-header">
          <h2>{trabajador.NombreCompleto}</h2>
          <button className="detail-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="detail-modal-body">
          <div className="detail-sections">
            {/* Información Personal */}
            <section className="detail-section">
              <h3>📋 Información Personal</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Nombre Completo:</label>
                  <span>{trabajador.NombreCompleto}</span>
                </div>
                <div className="detail-item">
                  <label>Apellido Paterno:</label>
                  <span>{trabajador.ApellidoPaterno || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Apellido Materno:</label>
                  <span>{trabajador.ApellidoMaterno || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Fecha de Nacimiento:</label>
                  <span>{formatDate(trabajador.FechaNacimiento)}</span>
                </div>
              </div>
            </section>

            {/* Información Laboral */}
            <section className="detail-section">
              <h3>🏢 Información Laboral</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Puesto:</label>
                  <span>{trabajador.Puesto || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Clave de Empleado:</label>
                  <span>{trabajador.ClaveEmpleado || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Fecha de Ingreso:</label>
                  <span>{formatDate(trabajador.FechaIngreso)}</span>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="detail-section">
              <h3>📞 Contacto</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Teléfono:</label>
                  <span>{trabajador.Telefono || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Correo:</label>
                  <span>{trabajador.Correo || '—'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Dirección:</label>
                  <span>{trabajador.Direccion || '—'}</span>
                </div>
              </div>
            </section>

            {/* Identificación */}
            <section className="detail-section">
              <h3>🆔 Identificación</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>INE Clave:</label>
                  <span>{trabajador.INE_Clave || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>CURP:</label>
                  <span>{trabajador.CURP || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>RFC:</label>
                  <span>{trabajador.RFC || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>NSS:</label>
                  <span>{trabajador.NSS || '—'}</span>
                </div>
              </div>
            </section>

            {/* Estado */}
            <section className="detail-section">
              <h3>⚙️ Estado</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Estatus:</label>
                  <span className={`estatus-badge ${getEstatusClass(trabajador.EstatusID)}`}>
                    {getEstatusName(trabajador.EstatusID)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="detail-modal-footer">
          <button className="detail-close-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const getEstatusName = (id) => {
  const estatuses = {
    1: 'Activa',
    2: 'Cerrada',
    3: 'Recuperada',
    4: 'Baja'
  };
  return estatuses[id] || 'Desconocido';
};

const getEstatusClass = (id) => {
  const classes = {
    1: 'activa',
    2: 'cerrada',
    3: 'recuperada',
    4: 'baja'
  };
  return classes[id] || '';
};

export default DetailModal;

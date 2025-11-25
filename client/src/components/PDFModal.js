import React from 'react';
import '../styles/PDFModal.css';

const PDFModal = ({ isOpen, filePath, fileName, onClose }) => {
  if (!isOpen || !filePath) return null;

  // Si la ruta es relativa, construir la URL completa al backend
  const fullPath = filePath.startsWith('http') 
    ? filePath 
    : `http://localhost:5000${filePath}`;

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal-container" onClick={e => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <h2>{fileName || 'Documento PDF'}</h2>
          <button className="pdf-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pdf-modal-body">
          <iframe 
            src={fullPath}
            type="application/pdf"
            width="100%"
            height="100%"
            title="PDF Viewer"
          />
        </div>
        <div className="pdf-modal-footer">
          <a 
            href={fullPath} 
            download={fileName}
            className="pdf-download-btn"
          >
            ⬇️ Descargar
          </a>
          <button className="pdf-close-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFModal;

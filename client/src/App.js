import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ObrasList from './components/ObrasList';
import ClientesList from './components/ClientesList';
import ProveedoresList from './components/ProveedoresList';
import IngresosList from './components/IngresosList';
import GastosList from './components/GastosList';
import AvancesList from './components/AvancesList';
import ObraForm from './components/ObraForm';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showObraForm, setShowObraForm] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'obras':
        return <ObrasList />;
      case 'clientes':
        return <ClientesList />;
      case 'proveedores':
        return <ProveedoresList />;
      case 'ingresos':
        return <IngresosList />;
      case 'gastos':
        return <GastosList />;
      case 'avances':
        return <AvancesList />;
      case 'agregarProyecto':
        return <ObraForm onClose={() => setCurrentPage('obras')} onSaved={() => setCurrentPage('obras')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">N</span>
            <div className="logo-text">
              <h1>NexusCode</h1>
              <p>Gestión de Obras</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`menu-item ${currentPage === 'ingresos' ? 'active' : ''}`}
            onClick={() => setCurrentPage('ingresos')}
          >
            <span className="icon">📈</span>
            <span>Ingresos</span>
          </button>
          <button
            className={`menu-item ${currentPage === 'gastos' ? 'active' : ''}`}
            onClick={() => setCurrentPage('gastos')}
          >
            <span className="icon">📉</span>
            <span>Gastos</span>
          </button>
          <button
            className={`menu-item ${currentPage === 'proveedores' ? 'active' : ''}`}
            onClick={() => setCurrentPage('proveedores')}
          >
            <span className="icon">👥</span>
            <span>Proveedores</span>
          </button>
          <button
            className={`menu-item ${currentPage === 'avances' ? 'active' : ''}`}
            onClick={() => setCurrentPage('avances')}
          >
            <span className="icon">📊</span>
            <span>Avances</span>
          </button>
          <hr className="menu-divider" />
          <button 
            className="menu-item add-project"
            onClick={() => setCurrentPage('agregarProyecto')}
          >
            <span className="icon">➕</span>
            <span>Agregar Proyecto</span>
          </button>
          <button className="menu-item settings">
            <span className="icon">⚙️</span>
            <span>Configuración</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <p className="user-name">Administrador</p>
              <p className="user-email">admin@nexuscode.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

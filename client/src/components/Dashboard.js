import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [obras, setObras] = useState([]);
  const [selectedObra, setSelectedObra] = useState(null);
  const [stats, setStats] = useState({
    totalObras: 0,
    totalClientes: 0,
    totalProveedores: 0,
    totalIngresos: 0,
    totalGastos: 0,
    balance: 0
  });
  const [chartData, setChartData] = useState([]);
  const [ingresosCategoryData, setIngresosCategoryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [ultimosMovimientos, setUltimosMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedObra) {
      loadProjectStats();
    }
  }, [selectedObra]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all obras
      const obrasData = await api.obrasAPI.getAll();
      setObras(obrasData || []);
      
      if (obrasData && obrasData.length > 0) {
        setSelectedObra(obrasData[0]);
      } else {
        loadGlobalStats();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      loadGlobalStats();
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const [clientes, proveedores] = await Promise.all([
        api.clientesAPI.getAll(),
        api.proveedoresAPI.getAll()
      ]);

      setStats({
        totalObras: (obras || []).length,
        totalClientes: (clientes || []).length,
        totalProveedores: (proveedores || []).length,
        totalIngresos: 0,
        totalGastos: 0,
        balance: 0
      });
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  };

  const loadProjectStats = async () => {
    try {
      setLoading(true);
      
      // Load only the 3 main categories like GastosList
      const [ingresos, materialesResp, maquinariaResp, nominaResp] = await Promise.all([
        api.ingresosAPI.getByObra(selectedObra.ObraID),
        api.materialesAPI?.getByObra(selectedObra.ObraID),
        api.maquinariaAPI?.getByObra(selectedObra.ObraID),
        api.nominaAPI?.getByObra(selectedObra.ObraID)
      ]);
      
      // Ensure all responses are arrays
      const mat = Array.isArray(materialesResp) ? materialesResp : [];
      const maq = Array.isArray(maquinariaResp) ? maquinariaResp : [];
      const nom = Array.isArray(nominaResp) ? nominaResp : [];
      const ing = Array.isArray(ingresos) ? ingresos : [];

      // Calculate category totals - only 3 categories like GastosList
      const categoryTotals = {
        'Materiales': (mat || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0),
        'Maquinaria': (maq || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0),
        'Sueldos': (nom || []).reduce((sum, n) => sum + (n.MontoPagado || 0), 0)
      };

      const totalGastos = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
      const totalIngresos = (ing || []).reduce((sum, i) => sum + (i.Monto || 0), 0);
      const balance = totalIngresos - totalGastos;

      console.log('📊 Dashboard data loaded:', {
        materiales: mat.length,
        maquinaria: maq.length,
        sueldos: nom.length,
        ingresos: ing.length,
        totalIngresos,
        totalGastos,
        balance
      });

      setStats({
        totalObras: obras.length,
        totalClientes: 0,
        totalProveedores: 0,
        totalIngresos,
        totalGastos,
        balance
      });

      // Simple data for Ingresos vs Gastos comparison (just 2 bars)
      const comparisonData = [
        {
          name: 'Resumen Financiero',
          Ingresos: totalIngresos,
          Gastos: totalGastos
        }
      ];

      setChartData(comparisonData);

      // Prepare ingresos category data for pie chart (distribution by tipo ingreso)
      const tiposIngresoMap = {};
      (ing || []).forEach(ingreso => {
        const tipoNombre = ingreso.TipoNombre || 'Sin tipo';
        if (!tiposIngresoMap[tipoNombre]) {
          tiposIngresoMap[tipoNombre] = 0;
        }
        tiposIngresoMap[tipoNombre] += ingreso.Monto || 0;
      });

      const ingresosCategoryChartData = Object.entries(tiposIngresoMap)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value
        }));
      
      setIngresosCategoryData(ingresosCategoryChartData);

      // Prepare category data for pie chart
      const categoryChartData = Object.entries(categoryTotals)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value
        }));
      
      setCategoryData(categoryChartData);

      // Prepare últimos movimientos combining ingresos and gastos (3 categories only)
      const movimientos = [];
      
      // Add ingresos
      (ing || []).forEach(ingreso => {
        movimientos.push({
          Fecha: ingreso.Fecha,
          Tipo: 'Ingreso',
          Categoría: ingreso.TipoIngreso || 'Estimación',
          Descripción: ingreso.Descripcion || 'Sin descripción',
          Monto: ingreso.Monto,
          Color: '#2ecc71'
        });
      });

      // Add gastos - only 3 categories (Materiales, Maquinaria, Sueldos)
      (mat || []).forEach(gasto => {
        movimientos.push({
          Fecha: gasto.Fecha,
          Tipo: 'Gasto',
          Categoría: 'Materiales',
          Descripción: gasto.Descripcion || 'Material',
          Monto: gasto.TotalCompra,
          Color: '#e74c3c'
        });
      });

      (maq || []).forEach(gasto => {
        movimientos.push({
          Fecha: gasto.FechaInicio,
          Tipo: 'Gasto',
          Categoría: 'Maquinaria',
          Descripción: gasto.Descripcion || 'Maquinaria',
          Monto: gasto.CostoTotal,
          Color: '#e74c3c'
        });
      });

      (nom || []).forEach(gasto => {
        movimientos.push({
          Fecha: gasto.FechaPago,
          Tipo: 'Gasto',
          Categoría: 'Sueldos',
          Descripción: gasto.Comprobante || 'Pago de nómina',
          Monto: gasto.MontoPagado,
          Color: '#e74c3c'
        });
      });

      // Sort by date descending (most recent first) and get last 10
      movimientos.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
      console.log('📋 Últimos movimientos (Dashboard):', movimientos.slice(0, 10));
      setUltimosMovimientos(movimientos.slice(0, 10));

    } catch (error) {
      console.error('Error loading project stats:', error);
    } finally {
      setLoading(false);
    }
  };


  const MetricCard = ({ title, value, color, icon }) => (
    <div className={`dashboard-card ${color}`}>
      <h3>{icon} {title}</h3>
      <p className="card-number">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <p className="no-data">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Resumen de gestión de proyectos</p>
      </div>

      {/* Project Selector */}
      {obras.length > 0 && (
        <div className="project-selector-container">
          <label htmlFor="project-select" className="selector-label">Selecciona un Proyecto:</label>
          <select 
            id="project-select"
            className="project-select"
            value={selectedObra?.ObraID || ''} 
            onChange={(e) => {
              const selected = obras.find(o => o.ObraID === parseInt(e.target.value));
              setSelectedObra(selected);
            }}
          >
            <option value="">-- Todos los proyectos --</option>
            {obras.map(obra => (
              <option key={obra.ObraID} value={obra.ObraID}>
                {obra.Nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Ingresos" 
          value={`$${stats.totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          color="green"
          icon="💰"
        />
        <MetricCard 
          title="Total Gastos" 
          value={`$${stats.totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          color="red"
          icon="💸"
        />
        <MetricCard 
          title="Balance" 
          value={`$${stats.balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          color={stats.balance >= 0 ? 'green' : 'red'}
          icon="📊"
        />
      </div>

      {/* Charts Section */}
      {selectedObra && (
        <div className="charts-container">
          {/* Bar Chart - Ingresos vs Gastos */}
          {/* Pie Charts Row - Top */}
          <div className="charts-row-top">
            {/* Pie Chart - Ingresos by Category */}
            {ingresosCategoryData.length > 0 && (
              <div className="chart-box">
                <h2>🥧 Distribución de Ingresos por Categoría</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ingresosCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toLocaleString('es-MX')}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ingresosCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie Chart - Gastos by Category */}
            {categoryData.length > 0 && (
              <div className="chart-box">
                <h2>🥧 Distribución de Gastos por Categoría</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toLocaleString('es-MX')}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar Chart Row - Bottom (Full Width) */}
          {chartData.length > 0 && (
            <div className="chart-box chart-box-full">
              <h2>📊 Ingresos vs Gastos</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                  <Legend />
                  <Bar 
                    dataKey="Ingresos" 
                    fill="#2ecc71" 
                    name="Ingresos"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="Gastos" 
                    fill="#e74c3c" 
                    name="Gastos"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Últimos Movimientos Table */}
      {selectedObra && ultimosMovimientos.length > 0 && (
        <div className="dashboard-section">
          <h2>📑 Últimos Movimientos</h2>
          <div className="movimientos-table-wrapper">
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {ultimosMovimientos.map((movimiento, index) => (
                  <tr key={index} className={`movimiento-row ${movimiento.Tipo.toLowerCase()}`}>
                    <td className="fecha">{new Date(movimiento.Fecha).toLocaleDateString('es-MX')}</td>
                    <td className="tipo">
                      <span className={`tipo-badge ${movimiento.Tipo.toLowerCase()}`}>
                        {movimiento.Tipo === 'Ingreso' ? '↗️' : '↘️'} {movimiento.Tipo}
                      </span>
                    </td>
                    <td className="categoria">{movimiento.Categoría}</td>
                    <td className="descripcion">{movimiento.Descripción}</td>
                    <td className={`monto ${movimiento.Tipo.toLowerCase()}`}>
                      {movimiento.Tipo === 'Ingreso' ? '+' : '-'}${Math.abs(movimiento.Monto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {selectedObra && ultimosMovimientos.length === 0 && (
        <div className="dashboard-section">
          <h2>📑 Últimos Movimientos</h2>
          <p className="no-data">No hay movimientos registrados para este proyecto.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

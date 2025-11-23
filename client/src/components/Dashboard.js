import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [categoryData, setCategoryData] = useState([]);
  const [ultimosMovimientos, setUltimosMovimientos] = useState([]);
  const [generalProgress, setGeneralProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedObra) {
      loadProjectStats();
      loadProgressForObra(selectedObra.ObraID);
    }
  }, [selectedObra]);

  // Load progress for selected obra
  const loadProgressForObra = async (obraId) => {
    try {
      // Get reportes for the selected obra
      const reportes = await api.reportesAPI.getByObra(obraId);
      if (Array.isArray(reportes) && reportes.length > 0) {
        // Use the latest report progress (first one in array is the latest)
        const latestProgress = parseFloat(reportes[0].PorcentajeFisico) || 0;
        setGeneralProgress(latestProgress);
      } else {
        setGeneralProgress(0);
      }
    } catch (error) {
      console.error('Error loading progress for obra:', error);
      setGeneralProgress(0);
    }
  };

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
      
      const ingresos = await api.ingresosAPI.getByObra(selectedObra.ObraID);
      
      // Load all gastos categories just like GastosList
      const materialesResp = await api.materialesAPI?.getByObra(selectedObra.ObraID);
      const maquinariaResp = await api.maquinariaAPI?.getByObra(selectedObra.ObraID);
      const nominaResp = await api.nominaAPI?.getByObra(selectedObra.ObraID);
      const generalesResp = await api.gastosGeneralesAPI?.getByObra(selectedObra.ObraID);
      const retencionesResp = await api.retencionesAPI?.getByObra(selectedObra.ObraID);
      
      // Ensure all responses are arrays
      const mat = Array.isArray(materialesResp) ? materialesResp : [];
      const maq = Array.isArray(maquinariaResp) ? maquinariaResp : [];
      const nom = Array.isArray(nominaResp) ? nominaResp : [];
      const gen = Array.isArray(generalesResp) ? generalesResp : [];
      const ret = Array.isArray(retencionesResp) ? retencionesResp : [];

      // Calculate category totals matching GastosList
      const categoryTotals = {
        'Materiales': (mat || []).reduce((sum, m) => sum + (m.TotalCompra || 0), 0),
        'Maquinaria': (maq || []).reduce((sum, m) => sum + (m.CostoTotal || 0), 0),
        'Nómina': (nom || []).reduce((sum, n) => sum + (n.MontoPagado || 0), 0),
        'Generales': (gen || []).reduce((sum, g) => sum + (g.Monto || 0), 0),
        'Retenciones': (ret || []).reduce((sum, r) => sum + (r.Monto || 0), 0)
      };

      const totalGastos = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
      const totalIngresos = (ingresos || []).reduce((sum, i) => sum + (i.Monto || 0), 0);
      const balance = totalIngresos - totalGastos;

      setStats({
        totalObras: obras.length,
        totalClientes: 0,
        totalProveedores: 0,
        totalIngresos,
        totalGastos,
        balance
      });

      // Prepare chart data (accumulated ingresos/gastos over time)
      const timelineData = [];
      let ingAccum = 0, gastAccum = 0;
      
      const sortedIngresos = (ingresos || []).sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
      sortedIngresos.forEach((ingreso, index) => {
        ingAccum += ingreso.Monto || 0;
        timelineData.push({
          date: new Date(ingreso.Fecha).toLocaleDateString('es-MX'),
          ingresos: ingAccum,
          gastos: gastAccum
        });
      });

      // Combine all gastos for timeline
      const allGastos = [
        ...(mat || []).map(m => ({ fecha: m.Fecha, monto: m.TotalCompra })),
        ...(maq || []).map(m => ({ fecha: m.FechaInicio, monto: m.CostoTotal })),
        ...(nom || []).map(n => ({ fecha: n.FechaPago, monto: n.MontoPagado })),
        ...(gen || []).map(g => ({ fecha: g.Fecha, monto: g.Monto })),
        ...(ret || []).map(r => ({ fecha: r.Fecha, monto: r.Monto }))
      ];

      const sortedGastos = allGastos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      sortedGastos.forEach((gasto) => {
        gastAccum += gasto.monto || 0;
        const fecha = new Date(gasto.fecha).toLocaleDateString('es-MX');
        const existing = timelineData.find(d => d.date === fecha);
        if (existing) {
          existing.gastos = gastAccum;
        } else {
          timelineData.push({
            date: fecha,
            ingresos: ingAccum,
            gastos: gastAccum
          });
        }
      });

      setChartData(timelineData.sort((a, b) => new Date(a.date) - new Date(b.date)));

      // Prepare category data for pie chart
      const categoryChartData = Object.entries(categoryTotals)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value
        }));
      
      setCategoryData(categoryChartData);

      // Prepare últimos movimientos combining ingresos and gastos
      const movimientos = [];
      
      (ingresos || []).forEach(ingreso => {
        movimientos.push({
          Fecha: ingreso.Fecha,
          Tipo: 'Ingreso',
          Categoría: ingreso.TipoIngreso || 'Estimación',
          Descripción: ingreso.Descripcion || 'Sin descripción',
          Monto: ingreso.Monto,
          Color: '#2ecc71'
        });
      });

      // Add all gastos from all categories
      (mat || []).forEach(gasto => {
        movimientos.push({
          Fecha: gasto.Fecha,
          Tipo: 'Gasto',
          Categoría: 'Materiales',
          Descripción: gasto.FolioFactura || 'Material',
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
          Categoría: 'Nómina',
          Descripción: gasto.Comprobante || 'Pago de nómina',
          Monto: gasto.MontoPagado,
          Color: '#e74c3c'
        });
      });

      (gen || []).forEach(gasto => {
        movimientos.push({
          Fecha: gasto.Fecha,
          Tipo: 'Gasto',
          Categoría: 'Generales',
          Descripción: gasto.Descripcion || 'Gasto general',
          Monto: gasto.Monto,
          Color: '#e74c3c'
        });
      });

      (ret || []).forEach(gasto => {
        movimientos.push({
          Fecha: gasto.Fecha,
          Tipo: 'Gasto',
          Categoría: 'Retenciones',
          Descripción: gasto.Descripcion || 'Retención',
          Monto: gasto.Monto,
          Color: '#e74c3c'
        });
      });

      // Sort by date descending (most recent first) and get last 10
      movimientos.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
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

      {/* 📊 General Progress Bar Section */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Avance General de Proyectos</span>
          <span className="progress-percentage">{generalProgress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${generalProgress}%`,
              transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          />
        </div>
        <div className="progress-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Charts Section */}
      {selectedObra && (
        <div className="charts-container">
          {/* Bar Chart - Ingresos vs Gastos */}
          {chartData.length > 0 && (
            <div className="chart-box">
              <h2>📊 Ingresos vs Gastos</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                  <Legend />
                  <Bar 
                    dataKey="ingresos" 
                    fill="#2ecc71" 
                    name="Ingresos"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="gastos" 
                    fill="#e74c3c" 
                    name="Gastos"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
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
      )}

      {/* Últimos Movimientos Table */}
      {ultimosMovimientos.length > 0 && (
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
    </div>
  );
};

export default Dashboard;

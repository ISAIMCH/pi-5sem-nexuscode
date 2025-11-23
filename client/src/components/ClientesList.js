import React, { useState, useEffect } from 'react';
import { clientesAPI } from '../services/api';
import '../styles/ClientesList.css';

const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    Nombre: '',
    RFC: '',
    Telefono: '',
    Correo: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesAPI.getAll();
      setClientes(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los clientes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await clientesAPI.create(formData);
      setFormData({ Nombre: '', RFC: '', Telefono: '', Correo: '' });
      setShowForm(false);
      fetchClientes();
    } catch (err) {
      setError('Error al crear cliente: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="clientes-container">
      <h1>Clientes</h1>
      {error && <div className="error">{error}</div>}
      
      <button 
        className="btn-primary"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancelar' : 'Nuevo Cliente'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="cliente-form">
          <input
            type="text"
            name="Nombre"
            placeholder="Nombre del cliente"
            value={formData.Nombre}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="RFC"
            placeholder="RFC"
            value={formData.RFC}
            onChange={handleInputChange}
          />
          <input
            type="tel"
            name="Telefono"
            placeholder="Teléfono"
            value={formData.Telefono}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="Correo"
            placeholder="Correo"
            value={formData.Correo}
            onChange={handleInputChange}
          />
          <button type="submit" className="btn-save">Guardar</button>
        </form>
      )}

      <table className="clientes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>RFC</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.ClienteID}>
              <td>{cliente.ClienteID}</td>
              <td>{cliente.Nombre}</td>
              <td>{cliente.RFC}</td>
              <td>{cliente.Telefono}</td>
              <td>{cliente.Correo}</td>
              <td>
                <button className="btn-edit">Editar</button>
                <button className="btn-delete">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesList;

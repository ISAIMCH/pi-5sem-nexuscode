const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }
  return data;
};

// Clientes
export const clientesAPI = {
  getAll: () => fetch(`${API_URL}/clientes`).then(handleResponse),
  getById: (id) => fetch(`${API_URL}/clientes/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Proveedores
export const proveedoresAPI = {
  getAll: () => fetch(`${API_URL}/proveedores`).then(handleResponse),
  getById: (id) => fetch(`${API_URL}/proveedores/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/proveedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/proveedores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/proveedores/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Obras
export const obrasAPI = {
  getAll: () => fetch(`${API_URL}/obras`).then(handleResponse),
  getById: (id) => fetch(`${API_URL}/obras/${id}`).then(handleResponse),
  getResumen: (id) => fetch(`${API_URL}/obras/${id}/resumen`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/obras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/obras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/obras/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Ingresos
export const ingresosAPI = {
  getAll: () => fetch(`${API_URL}/ingresos`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/ingresos/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/ingresos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/ingresos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/ingresos/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Gastos
export const gastosAPI = {
  getAll: () => fetch(`${API_URL}/gastos`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/gastos/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/gastos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/gastos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Catálogos
export const catalogosAPI = {
  getAll: () => fetch(`${API_URL}/catalogos`).then(handleResponse),
  getTiposProveedor: () => fetch(`${API_URL}/catalogos/tipos-proveedor`).then(handleResponse),
  getTiposIngreso: () => fetch(`${API_URL}/catalogos/tipos-ingreso`).then(handleResponse),
  getCategoriasGasto: () => fetch(`${API_URL}/catalogos/categorias-gasto`).then(handleResponse),
  getTiposRetencion: () => fetch(`${API_URL}/catalogos/tipos-retencion`).then(handleResponse),
  getEstatuses: () => fetch(`${API_URL}/catalogos/estatuses`).then(handleResponse),
};

// Materiales (Compra de Materiales)
export const materialesAPI = {
  getAll: () => fetch(`${API_URL}/materiales`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/materiales/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/materiales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/materiales/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/materiales/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Maquinaria (Renta de Maquinaria)
export const maquinariaAPI = {
  getAll: () => fetch(`${API_URL}/maquinaria`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/maquinaria/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/maquinaria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/maquinaria/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/maquinaria/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Nómina (Pago de Nómina)
export const nominaAPI = {
  getAll: () => fetch(`${API_URL}/nomina`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/nomina/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/nomina`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/nomina/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/nomina/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Gastos Generales
export const gastosGeneralesAPI = {
  getAll: () => fetch(`${API_URL}/gastos-generales`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/gastos-generales/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/gastos-generales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/gastos-generales/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/gastos-generales/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Retenciones
export const retencionesAPI = {
  getAll: () => fetch(`${API_URL}/retenciones`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/retenciones/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/retenciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/retenciones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/retenciones/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// Trabajadores
export const trabajadoresAPI = {
  getAll: () => fetch(`${API_URL}/trabajadores`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/trabajadores/obra/${obraId}`).then(handleResponse),
  getById: (id) => fetch(`${API_URL}/trabajadores/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/trabajadores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/trabajadores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/trabajadores/${id}`, { method: 'DELETE' }).then(handleResponse),
  assignToObra: (id, obraId) => fetch(`${API_URL}/trabajadores/${id}/asignar-obra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ obraId })
  }).then(handleResponse),
  removeFromObra: (id, obraId) => fetch(`${API_URL}/trabajadores/${id}/remover-obra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ obraId })
  }).then(handleResponse),
};

export const reportesAPI = {
  getAll: () => fetch(`${API_URL}/reportes`).then(handleResponse),
  getByObra: (obraId) => fetch(`${API_URL}/reportes/obra/${obraId}`).then(handleResponse),
  create: (data) => fetch(`${API_URL}/reportes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_URL}/reportes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_URL}/reportes/${id}`, { method: 'DELETE' }).then(handleResponse),
  getById: (id) => fetch(`${API_URL}/reportes/${id}`).then(handleResponse),
};

// Export default con todos los APIs
export default {
  clientesAPI,
  proveedoresAPI,
  obrasAPI,
  ingresosAPI,
  gastosAPI,
  catalogosAPI,
  reportesAPI,
  materialesAPI,
  maquinariaAPI,
  nominaAPI,
  gastosGeneralesAPI,
  retencionesAPI,
  trabajadoresAPI
};

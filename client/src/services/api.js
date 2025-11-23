const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Clientes
export const clientesAPI = {
  getAll: () => fetch(`${API_URL}/clientes`).then(r => r.json()),
  getById: (id) => fetch(`${API_URL}/clientes/${id}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Proveedores
export const proveedoresAPI = {
  getAll: () => fetch(`${API_URL}/proveedores`).then(r => r.json()),
  getById: (id) => fetch(`${API_URL}/proveedores/${id}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/proveedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/proveedores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/proveedores/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Obras
export const obrasAPI = {
  getAll: () => fetch(`${API_URL}/obras`).then(r => r.json()),
  getById: (id) => fetch(`${API_URL}/obras/${id}`).then(r => r.json()),
  getResumen: (id) => fetch(`${API_URL}/obras/${id}/resumen`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/obras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/obras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/obras/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Ingresos
export const ingresosAPI = {
  getAll: () => fetch(`${API_URL}/ingresos`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/ingresos/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/ingresos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/ingresos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/ingresos/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Gastos
export const gastosAPI = {
  getAll: () => fetch(`${API_URL}/gastos`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/gastos/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/gastos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/gastos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Catálogos
export const catalogosAPI = {
  getAll: () => fetch(`${API_URL}/catalogos`).then(r => r.json()),
  getTiposProveedor: () => fetch(`${API_URL}/catalogos/tipos-proveedor`).then(r => r.json()),
  getTiposIngreso: () => fetch(`${API_URL}/catalogos/tipos-ingreso`).then(r => r.json()),
  getCategoriasGasto: () => fetch(`${API_URL}/catalogos/categorias-gasto`).then(r => r.json()),
  getTiposRetencion: () => fetch(`${API_URL}/catalogos/tipos-retencion`).then(r => r.json()),
  getEstatuses: () => fetch(`${API_URL}/catalogos/estatuses`).then(r => r.json()),
};

// Materiales (Compra de Materiales)
export const materialesAPI = {
  getAll: () => fetch(`${API_URL}/materiales`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/materiales/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/materiales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/materiales/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/materiales/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Maquinaria (Renta de Maquinaria)
export const maquinariaAPI = {
  getAll: () => fetch(`${API_URL}/maquinaria`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/maquinaria/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/maquinaria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/maquinaria/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/maquinaria/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Nómina (Pago de Nómina)
export const nominaAPI = {
  getAll: () => fetch(`${API_URL}/nomina`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/nomina/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/nomina`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/nomina/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/nomina/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Gastos Generales
export const gastosGeneralesAPI = {
  getAll: () => fetch(`${API_URL}/gastos-generales`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/gastos-generales/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/gastos-generales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/gastos-generales/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/gastos-generales/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Retenciones
export const retencionesAPI = {
  getAll: () => fetch(`${API_URL}/retenciones`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/retenciones/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/retenciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/retenciones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/retenciones/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Trabajadores
export const trabajadoresAPI = {
  getAll: () => fetch(`${API_URL}/trabajadores`).then(r => r.json()),
  getById: (id) => fetch(`${API_URL}/trabajadores/${id}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/trabajadores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/trabajadores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/trabajadores/${id}`, { method: 'DELETE' }).then(r => r.json()),
};
export const reportesAPI = {
  getAll: () => fetch(`${API_URL}/reportes`).then(r => r.json()),
  getByObra: (obraId) => fetch(`${API_URL}/reportes/obra/${obraId}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/reportes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_URL}/reportes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_URL}/reportes/${id}`, { method: 'DELETE' }).then(r => r.json()),
  getById: (id) => fetch(`${API_URL}/reportes/${id}`).then(r => r.json()),
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

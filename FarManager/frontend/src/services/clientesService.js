// src/services/clientesService.js

//const API_URL = "http://localhost:3001";
const API_URL = process.env.REACT_APP_API_URL;

//* Para la tabla clientes
export const getClientes = async () => {
  const res = await fetch(`${API_URL}/clientes`);
  return res.json();
};

export const createCliente = async (cliente) => {
  const res = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  return res.json();
};

export const updateCliente = async (id, cliente) => {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  return res.json();
};

export const deleteCliente = async (id) => {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  return res.json();
};

//* Para la tabla de tipo de documentos
export const getTiposDocumentos = async () => {
  const res = await fetch(`${API_URL}/tiposdocumentos`);
  return res.json();
};
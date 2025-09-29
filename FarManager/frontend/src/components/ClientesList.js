// src/components/ClientesList.js
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function ClientesList({ clientes, onEdit, onDelete }) {
  return (
    <div className="clientes-list-container table-responsive mt-4">
      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Tipo Documento</th>
            <th>Documento</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Fecha Creación</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.ClienteID}>
              <td>{c.ClienteID}</td>
              <td>{c.Nombres}</td>
              <td>{c.Apellidos}</td>
              <td>{c.TipoDocumento}</td>
              <td>{c.Documento}</td>
              <td>{c.Telefono || "-"}</td>
              <td>{c.Direccion || "-"}</td>
              {/* <td>{new Date(c.FechaCreacion).toLocaleString()}</td> */}
              <td>{new Date(c.FechaCreacion).toLocaleDateString()}</td>
              {/* <td>{c.FechaModificacion ? new Date(c.FechaModificacion).toLocaleString() : "-"}</td> */}
              <td>{c.FechaModificacion ? new Date(c.FechaModificacion).toLocaleDateString() : "-"}</td>

              <td>
                <button
                  className="btn btn-edit btn-sm me-2"
                  onClick={() => onEdit(c)}
                  title="Editar"
                >
                  <i className="bi bi-pencil-fill"></i>
                </button>
                <button
                  className="btn btn-delete btn-sm"
                  onClick={() => onDelete(c)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientesList;

// --- Estilos al final del archivo ---
const styles = document.createElement('style');
styles.innerHTML = `
  .clientes-list-container {
    max-width: 95%;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .btn-edit {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
  }
  .btn-edit:hover {
    background-color: #0b5ed7;
    border-color: #0a58ca;
    color: white;
  }

  .btn-delete {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }
  .btn-delete:hover {
    background-color: #c82333;
    border-color: #bd2130;
    color: white;
  }

  table.table th,
  table.table td {
    vertical-align: middle;
    text-align: center;
  }

  table.table-hover tbody tr:hover {
    background-color: #e9ecef;
    cursor: pointer;
  }
`;
document.head.appendChild(styles);

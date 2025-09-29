// src/pages/ClientesPage.js
import React, { useState, useEffect } from "react";
import ClienteForm from "../components/ClienteForm";
import ClientesList from "../components/ClientesList";
import Toast from "../components/recursos/Toast";
import CustomButton from "../components/recursos/CustomButton"; // <-- Importa el nuevo componente

import {
  getClientes,
  getTiposDocumentos,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../services/clientesService";

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");

  // Modal de eliminar
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Modal de edición
  const [showModalEditar, setShowModalEditar] = useState(false);

  // Estado para controlar la vista
  const [vistaActual, setVistaActual] = useState("inicio"); // 'inicio', 'agregar', 'ver'

  // Para la notificacion
  const [toastKey, setToastKey] = useState(Date.now());

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setClientes(await getClientes());
    setTiposDocumentos(await getTiposDocumentos());
  };

  const handleSubmit = async (cliente) => {
    try {
      if (clienteEditando) {
        await updateCliente(clienteEditando.ClienteID, cliente);
        setClienteEditando(null);
        setShowModalEditar(false);
        setMensaje("Cliente actualizado");
      } else {
        await createCliente(cliente);
        setMensaje("Cliente creado");
      }
      setTipoMensaje("success");
      await cargarDatos();
      setToastKey(Date.now());
      return true; // <-- ¡La clave para que el formulario se limpie!
    } catch (err) {
      const mensajeDeError = err.response?.data?.message || err.message;
      setMensaje("Ocurrió un error: " + mensajeDeError);
      setTipoMensaje("error");
      setToastKey(Date.now());
      return false; // <-- ¡La clave para que el formulario NO se limpie!
    }
  };

  const handleEdit = (cliente) => {
    setClienteEditando(cliente);
    setShowModalEditar(true);
    //setVistaActual("agregar"); // Muestra el formulario para editar
  };

  // Nueva función para volver al inicio
  const handleVolver = () => {
    setVistaActual("inicio");
    setMensaje("");
    setClienteEditando(null);
  };

  const abrirModalEliminar = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!clienteSeleccionado) return;
    try {
      await deleteCliente(clienteSeleccionado.ClienteID);
      setMensaje("Cliente eliminado");
      setTipoMensaje("success");
      await cargarDatos();
    } catch (err) {
      // Modifica esta línea para extraer el mensaje del error
      const mensajeDeError = err.response?.data?.message || err.message;
      setMensaje("Ocurrió un error: " + mensajeDeError);
      setTipoMensaje("error");
    } finally {
      setToastKey(Date.now());
      setShowModalEliminar(false);
      setClienteSeleccionado(null);
    }
  };

  const cancelarEliminar = () => {
    setShowModalEliminar(false);
    setClienteSeleccionado(null);
  };

  const cancelarEdicion = () => {
    setShowModalEditar(false);
    setClienteEditando(null);
  };

  return (
    <div className="clientes-page-container">
      {vistaActual === "inicio" && (
        <h1 className="page-title">Gestión de Clientes</h1>
      )}
      {vistaActual === "agregar" && (
        <h1 className="page-title">Agregar cliente:</h1>
      )}
      {vistaActual === "ver" && (
        <h1 className="page-title">Lista de clientes:</h1>
      )}

      {/*Notificaciones de errores o cambios*/}
      <Toast key={toastKey} message={mensaje} type={tipoMensaje} />

      {/* --- Renderizado Condicional de Vistas --- */}
      {vistaActual === "inicio" && (
        <div className="tarjetas-container">
          {/* Tarjeta 1: Agregar Cliente */}
          <div className="tarjeta" onClick={() => setVistaActual("agregar")}>
            <i className="bi bi-person-plus"></i>
            <h2>Agregar Cliente</h2>
            <p>Añade un nuevo cliente al sistema.</p>
          </div>
          {/* Tarjeta 2: Ver Clientes */}
          <div className="tarjeta" onClick={() => setVistaActual("ver")}>
            <i className="bi bi-people"></i>
            <h2>Ver Clientes</h2>
            <p>Ver, editar y eliminar los clientes existentes.</p>
          </div>
        </div>
      )}

      {vistaActual === "agregar" && (
        <>
          {/* <button className="btn-volver" onClick={handleVolver}>
            <i className="bi bi-arrow-left-square"></i> Volver
          </button> */}
          <CustomButton onClick={handleVolver} />
          <div className="clientes-form-wrapper">
            {/* <h2 className="form-title">
              {clienteEditando ? "Editar cliente:" : "Agregar cliente:"}
            </h2> */}
            <ClienteForm
              onSubmit={handleSubmit}
              clienteEditando={clienteEditando}
              tiposDocumentos={tiposDocumentos}
            />
          </div>
        </>
      )}

      {vistaActual === "ver" && (
        <>
          {/* <button className="btn-volver" onClick={handleVolver}>
            <i className="bi bi-arrow-left-square"></i> Volver
          </button> */}
          <CustomButton onClick={handleVolver} />
          <div className="clientes-list-wrapper">
            <ClientesList
              clientes={clientes}
              onEdit={handleEdit}
              onDelete={abrirModalEliminar}
            />
          </div>
        </>
      )}

      {/* Modal eliminar */}
      {showModalEliminar && clienteSeleccionado && (
        <div className="modal-overlay modal-delete">
          <div className="modal-content modal-delete-content">
            <h3>Confirmar Borrado</h3>
            <p>
              ¿Desea borrar al cliente{" "}
              <strong>
                {clienteSeleccionado.Nombres} {clienteSeleccionado.Apellidos}
              </strong>
              ?
            </p>
            <p>
              Documento: <b>[{clienteSeleccionado.TipoDocumento}]</b>{" "}
              {clienteSeleccionado.Documento}
            </p>
            <div className="modal-buttons">
              <button className="btn btn-confirm" onClick={confirmarEliminar}>
                Confirmar
              </button>
              <button className="btn btn-cancel" onClick={cancelarEliminar}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {showModalEditar && clienteEditando && (
        <div className="modal-overlay modal-edit">
          <div className="modal-content modal-edit-content">
            <h3>Editar Cliente</h3>
            <ClienteForm
              onSubmit={handleSubmit}
              clienteEditando={clienteEditando}
              tiposDocumentos={tiposDocumentos}
            />
            <div className="modal-buttons">
              <button className="btn btn-cancel" onClick={cancelarEdicion}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientesPage;

// --- Estilos al final del archivo ---
const styles = document.createElement("style");
styles.innerHTML = `
  .clientes-page-container {
    min-width: 100%;
    min-height: 100vh;
    margin: 0 auto;
    padding: 40px 20px 20px 20px;
    font-family: 'Open Sans', sans-serif;
  }

  .page-title {
    text-align: center;
    font-size: 48px;
    font-weight: 800;
    margin: 0 auto;
    color: #0b5ed7;
  }

  /* INICIO: tarjetas de las opciones */
.tarjetas-container {
  max-width: 100%;
  min-height: 75vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin: 50px 0 0 0;
}

.tarjeta {
  background-color: #f0f8ff; /* Azul muy claro */
  border: 1px solid #cce5ff; /* Borde azul claro */
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  max-width: 300px;
  max-height: 300px;
  width: 300px;
  height: 300px;
}

.tarjeta:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.tarjeta h2 {
  font-size: 24px;
  color: #0d6efd; /* Azul principal de Bootstrap */
  margin-bottom: 10px;
}

.tarjeta p {
  color: #6c757d; /* Gris de Bootstrap */
  font-size: 16px;
}

/* Estilo para los iconos dentro de las tarjetas */
.tarjeta i {
  font-size: 60px; /* Tamaño del icono */
  color: #0d6efd; /* Color azul del icono */
  margin-bottom: 10px;
}

  /* Modales comunes */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99;
    margin: 0;
    padding: 0;
  }

  .modal-content {
    background: white;
    padding: 20px 100px;
    border-radius: 15px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }

  .modal-content h3 {
    margin: 0;
  }

  .modal-buttons {
    margin-top: 0px;
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  /* Estilos únicos */
.modal-delete-content {
    padding: 50px 20px;
}

.modal-edit-content{

}

.modal-edit-content {
  max-width: 50%; /* más ancho para el formulario de edición */
}

  /* Botones de confirmar/cancelar */
  .btn-confirm {
    background-color: #0d6efd;
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  .btn-confirm:hover {
    background-color: #0b5ed7;
    color: white;
  }

  .btn-cancel {
    background-color: #dc3545;
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  .btn-cancel:hover {
    background-color: #c82333;
    color: white;
  }

  /* ClienteForm dentro del modal de edición */
  .modal-content .cliente-form-container {
    max-width: 100%;
    padding: 0;
    box-shadow: none;
    background: none;
  }

  .cliente-form-container {
    width: 100%;
  }

  .form-container label{
  text-align: left;
  }

  .modal-content .cliente-form-container input,
  .modal-content .cliente-form-container select {
    margin-bottom: 7px;
  }

  .modal-content .cliente-form-container button.btn-submit {
    margin-top: 10px;
    width: 50%;
  }

  /* Contenedor del formulario */
.clientes-form-wrapper {
  max-width: 100%;
  margin: 0 auto;  /* Centrado y con margen inferior */
  padding: 20px 20%;
  background: #f9f9f9;
  border-radius: 15px;
}

.clientes-form-wrapper .form-title{
  text-align: center;
  font-size: 30px;
  font-weight: 700;
  color: #003f17;
}

/* Contenedor de la lista */
.clientes-list-wrapper {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 15px;
}

.btn-volver {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: #0b5ed7;
  border: 2px solid; 
  border-color: #0b5ed7;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.btn-volver:hover,
.btn-volver:focus {
  background-color: #0b5ed7;
  color: #ffffff;
  border-color: #0b5ed7; /* Borde del mismo color que el fondo */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-volver:active {
  background-color: #0b5ed7;
  color: #ffffff;
  border-color: #0b5ed7;
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
`;
document.head.appendChild(styles);

// src/components/ClienteForm.js
import React, { useState, useEffect } from "react";

function ClienteForm({ onSubmit, clienteEditando, tiposDocumentos }) {
  const [form, setForm] = useState({
    Nombres: "",
    Apellidos: "",
    TipoDocumentoID: "1",
    Documento: "",
    Telefono: "",
    Direccion: "",
    Activo: true,
  });

    // Nuevo estado para los errores de validación
  const [errors, setErrors] = useState({});

  // const [mensaje, setMensaje] = useState("");
  // const [tipoMensaje, setTipoMensaje] = useState("success"); // 'success' o 'error'

  // Cuando se pasa un cliente a editar, llenamos el formulario
  useEffect(() => {
    if (clienteEditando) setForm(clienteEditando);
  }, [clienteEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value }); 
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

// Nueva función de validación
  const validateForm = () => {
    const newErrors = {};

 // Validar campos obligatorios
    if (!form.Nombres?.trim()) newErrors.Nombres = "El nombre es obligatorio.";
    if (!form.Apellidos?.trim()) newErrors.Apellidos = "El apellido es obligatorio.";
    if (!form.Documento?.trim()) newErrors.Documento = "El documento es obligatorio.";

    // Validar longitud máxima de los campos, usando || '' para manejar valores null
    if ((form.Nombres || '').length > 50) newErrors.Nombres = "El nombre no puede exceder los 50 caracteres.";
    if ((form.Apellidos || '').length > 50) newErrors.Apellidos = "El apellido no puede exceder los 50 caracteres.";
    if ((form.Documento || '').length > 20) newErrors.Documento = "El documento no puede exceder los 20 caracteres.";
    if ((form.Telefono || '').length > 20) newErrors.Telefono = "El teléfono no puede exceder los 20 caracteres.";
    if ((form.Direccion || '').length > 200) newErrors.Direccion = "La dirección no puede exceder los 200 caracteres.";

    setErrors(newErrors);
    // Retorna true si no hay errores, false si los hay
    return Object.keys(newErrors).length === 0;
  };
  
const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el formulario antes de enviar
    const isValid = validateForm();
    if (!isValid) {
      return; // Detiene el envío si hay errores de validación
    }

    const isSuccess = await onSubmit(form);

    // Solo limpia el formulario si la operación fue exitosa y no estamos editando
    if (isSuccess && !clienteEditando) {
        setForm({
            Nombres: "",
            Apellidos: "",
            TipoDocumentoID: "1",
            Documento: "",
            Telefono: "",
            Direccion: "",
            Activo: true,
        });
    }
};

  return (
    <div className="cliente-form-container">
      <form onSubmit={handleSubmit} className="form-container">
        <label>
          Nombres <span className="obligatorio">*</span>
        </label>
        <input
          name="Nombres"
          placeholder="Nombres"
          value={form.Nombres}
          onChange={handleChange}
        />
        {errors.Nombres && <p className="error-text">{errors.Nombres}</p>}

        <label>
          Apellidos <span className="obligatorio">*</span>
        </label>
        <input
          name="Apellidos"
          placeholder="Apellidos"
          value={form.Apellidos}
          onChange={handleChange}
        />
        {errors.Apellidos && <p className="error-text">{errors.Apellidos}</p>}

        <label>
          Tipo Documento <span className="obligatorio">*</span>
        </label>
        <select
          name="TipoDocumentoID"
          value={form.TipoDocumentoID}
          onChange={handleChange}
        >
          {/* <option value="">Seleccione tipo documento</option> */}
          {tiposDocumentos.map((t) => (
            <option key={t.TipoDocumentoID} value={t.TipoDocumentoID}>
              {t.Nombre}
            </option>
          ))}
        </select>

        <label>
          Documento <span className="obligatorio">*</span>
        </label>
        <input
          name="Documento"
          placeholder="Documento"
          value={form.Documento}
          onChange={handleChange}
        />
        {errors.Documento && <p className="error-text">{errors.Documento}</p>}

        <label>Teléfono</label>
        <input
          name="Telefono"
          placeholder="Teléfono"
          value={form.Telefono}
          onChange={handleChange}
        />
        {errors.Telefono && <p className="error-text">{errors.Telefono}</p>}

        <label>Dirección</label>
        <input
          name="Direccion"
          placeholder="Dirección"
          value={form.Direccion}
          onChange={handleChange}
        />
        {errors.Direccion && <p className="error-text">{errors.Direccion}</p>}

        <button type="submit" className="btn-submit">
          {clienteEditando ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}

export default ClienteForm;

// --- Estilos al final del archivo ---
const styles = document.createElement('style');
styles.innerHTML = `
  .cliente-form-container {
    max-width: 100%;
    margin: 20px auto;
    padding: 25px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .form-container{
  max-width: 100%;
  }

  .cliente-form-container input,
  .cliente-form-container select {
    width: 100%;
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .cliente-form-container button.btn-submit {
    padding: 8px 30px;
    border-radius: 5px;
    border: none;
    color: white;
    background-color: #22C55E;
    cursor: pointer;
  }
  .cliente-form-container button.btn-submit:hover {
    background-color: #02ac41ff;
  }

  .mensaje {
    font-size: 18px;
    text-align: center;
    border-radius: 8px;
    width: 80%;
    margin: 10px auto;
    padding: 8px;
  }

  .mensaje-success {
    background-color: #d1e7dd;
    color: #0f5132;
    border: 1px solid #badbcc;
  }

  .mensaje-error {
    background-color: #f8d7da;
    color: #842029;
    border: 1px solid #f5c2c7;
  }

  .cliente-form-container label {
    display: block;
    margin-bottom: 4px;
    font-weight: 600;
  }

  .obligatorio {
    color: red;
  }

  .error-text {
    color: red;
    font-size: 14px;
    margin-top: -8px;
    margin-bottom: 12px;
  }
`;
document.head.appendChild(styles);

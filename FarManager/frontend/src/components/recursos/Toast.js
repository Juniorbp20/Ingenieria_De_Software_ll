import React, { useState, useEffect } from 'react';

function Toast({ message, type, duration = 5000 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="mensaje-container">
            <div className={`mensaje mensaje-${type}`}>
                {type === 'error' && <i className="bi bi-exclamation-triangle-fill"></i>}
                {type === 'success' && <i className="bi bi-check-circle-fill"></i>}
                <span>{message}</span>
            </div>
        </div>
    );
}

export default Toast;

// --- Estilos al final del archivo ---
const styles = document.createElement('style');
styles.innerHTML = `
/* Nuevo estilo para el contenedor del mensaje flotante */
.mensaje-container {
  position: fixed;
  bottom: 10px;
  right: 20px;
  z-index: 100;
  width: fit-content;
}

.mensaje {
  width: fit-content;
  font-weight: 700;
  font-size: 18px; /* Ajustado para mejor legibilidad en un toast */
  text-align: center;
  border-radius: 8px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: slide-in 0.5s forwards, fade-out 0.5s 4.5s forwards;
  /* La animación 'fade-out' inicia después de 4.5 segundos */
}

/* Estilos de los iconos */
.mensaje i {
  font-size: 20px;
}

/* Colores de los iconos de acuerdo al tipo de mensaje */
.mensaje-success i {
  color: #155724; /* Color verde del texto */
}

.mensaje-error i {
  color: #721c24; /* Color rojo del texto */
}

/* Animaciones de entrada y salida */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    visibility: hidden;
  }
}

.mensaje-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensaje-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
`;
document.head.appendChild(styles);
import React, { useEffect } from 'react';

// CSS para el botón de Volver
const backButtonStyles = `
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
    border-color: #0b5ed7;
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

function CustomButton({ onClick, text = "Volver", icon = "bi-arrow-left-square" }) {
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = backButtonStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <button className="btn-volver" onClick={onClick}>
      <i className={`bi ${icon}`}></i> {text}
    </button>
  );
}

export default CustomButton;
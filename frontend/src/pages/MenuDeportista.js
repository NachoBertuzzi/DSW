import React from 'react';

export default function MenuDeportista({ onLogout }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  return (
    <div>
      <h2>Menú Deportista</h2>
      <p>Hola {usuario?.nombre || usuario?.usuario}</p>

      {/* Opciones del deportista */}
      <ul>
        <li>Registrar entrenamiento</li>
        <li>Ver progreso</li>
        <li>Mi perfil</li>
      </ul>

      <button onClick={onLogout} style={{ marginTop: 12 }}>Cerrar sesión</button>
    </div>
  );
}

import React from 'react';

export default function MenuEntrenador({ onLogout }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  return (
    <div>
      <h2>Menú Entrenador</h2>
      <p>Hola {usuario?.nombre || usuario?.usuario}</p>

      {/* Opciones del entrenador */}
      <ul>
        <li>Mis deportistas</li>
        <li>Planificar sesiones</li>
        <li>Mi perfil</li>
      </ul>

      <button onClick={onLogout} style={{ marginTop: 12 }}>Cerrar sesión</button>
    </div>
  );
}

import React, { useState } from 'react';

const LoginPage = ({ onVolver, onLoginSuccess }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [mensajeLogin, setMensajeLogin] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si movés el backend, ajustá este base URL
  const urlBase = 'http://localhost:3000/api';

  async function intentarLogin(url, tipoLabel) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Enviamos 'contrasena' sin tilde. El backend acepta ambas variantes.
      body: JSON.stringify({ usuario: loginEmail, contrasena: loginPassword }),
    });

    if (res.status === 401) {
      // Credenciales malas para este tipo: avisamos y dejamos que pruebe el otro tipo
      const err = await res.json().catch(() => ({}));
      const msg = err?.mensaje || `Credenciales no válidas para ${tipoLabel}`;
      const e = new Error(msg);
      e.kind = 'bad-credentials';
      throw e;
    }

    if (!res.ok) {
      // Otro error (500, 400, etc.)
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.mensaje || 'Error del servidor');
    }

    const data = await res.json();
    return { tipo: tipoLabel, data };
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMensajeLogin('');
    setCargando(true);

    try {
      let resultado;

      try {
        // 1) Probar login como deportista
        resultado = await intentarLogin(`${urlBase}/deportistas/login`, 'deportista');
      } catch (e1) {
        if (e1.kind !== 'bad-credentials') throw e1; // error real, no seguir
        // 2) Si no, probar como entrenador
        resultado = await intentarLogin(`${urlBase}/entrenadores/login`, 'entrenador');
      }

      const { tipo, data } = resultado;
      const usuario = data.deportista || data.entrenador || {};

      // Persistencia mínima para que App.js decida el menú
      localStorage.setItem('tipo', tipo);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Aviso al App para redirigir
      onLoginSuccess?.({ tipo, usuario });
    } catch (err) {
      setMensajeLogin(err.message || 'Error al iniciar sesión');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLoginSubmit}>
        <div>
          <label>Email (usuario): </label>
          <input
            type="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Contraseña: </label>
          <input
            type="password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>

      <button onClick={onVolver} style={{ marginTop: 10 }}>
        Volver
      </button>

      {mensajeLogin && <p style={{ color: 'crimson' }}>{mensajeLogin}</p>}
    </div>
  );
};

export default LoginPage;
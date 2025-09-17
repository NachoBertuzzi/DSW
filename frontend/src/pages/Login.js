import React, { useState } from 'react';

const LoginPage = ({ onVolver, onLoginSuccess }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [mensajeLogin, setMensajeLogin] = useState('');

  const urlBase = 'http://localhost:3000/api';

  const intentarLogin = async (url, tipoLabel) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: loginEmail, contraseña: loginPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.mensaje || `Error login ${tipoLabel}`);
    }

    const data = await res.json();
    return { tipo: tipoLabel, data };
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMensajeLogin('');

    try {
      let resultado;
      try {
        resultado = await intentarLogin(`${urlBase}/deportistas/login`, 'deportista');
      } catch {
        resultado = await intentarLogin(`${urlBase}/entrenadores/login`, 'entrenador');
      }

      const { tipo, data } = resultado;
      const usuario = data.deportista || data.entrenador || {};

      // persistencia mínima
      localStorage.setItem('tipo', tipo);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      setMensajeLogin(`Bienvenido ${usuario?.usuario || loginEmail}`);

      // avisar a App
      onLoginSuccess?.({ tipo, usuario });
    } catch (error) {
      setMensajeLogin(error.message.includes('fetch') ? 'Error de conexión' : 'Credenciales incorrectas');
      console.error(error);
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
        <button type="submit">Entrar</button>
      </form>

      <button onClick={onVolver} style={{ marginTop: 10 }}>
        Volver
      </button>

      {mensajeLogin && <p>{mensajeLogin}</p>}
    </div>
  );
};

export default LoginPage;

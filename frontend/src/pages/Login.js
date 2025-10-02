import React, { useState } from 'react';
import '../pages/login.css';
import logo from '../assets/logo.png';

const LoginPage = ({ onVolver, onLoginSuccess }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [mensajeLogin, setMensajeLogin] = useState('');
  const [cargando, setCargando] = useState(false);

  const urlBase = 'http://localhost:3000/api';

  async function intentarLogin(url, tipoLabel) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: loginEmail, contrasena: loginPassword }),
    });

    if (res.status === 401) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.mensaje || `Credenciales no válidas para ${tipoLabel}`;
      const e = new Error(msg);
      e.kind = 'bad-credentials';
      throw e;
    }

    if (!res.ok) {
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
        resultado = await intentarLogin(`${urlBase}/deportistas/login`, 'deportista');
      } catch (e1) {
        if (e1.kind !== 'bad-credentials') throw e1;
        resultado = await intentarLogin(`${urlBase}/entrenadores/login`, 'entrenador');
      }
      const { tipo, data } = resultado;
      const usuario = data.deportista || data.entrenador || {};
      localStorage.setItem('tipo', tipo);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      onLoginSuccess?.({ tipo, usuario });
    } catch (err) {
      setMensajeLogin(err.message || 'Error al iniciar sesión');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="logo" className="login-logo" />
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLoginSubmit}>
          <label>Email (usuario):</label>
          <input
            type="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <label>Contraseña:</label>
          <input
            type="password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
        <button onClick={onVolver} style={{ marginTop: 10 }}>
          Volver
        </button>
        {mensajeLogin && <div className="login-message">{mensajeLogin}</div>}
      </div>
    </div>
  );
};

export default LoginPage;
import React, { useState } from 'react';
import '../pages/login.css';
import logo from '../assets/logo.png';

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:3000/api';

async function tryLogin(url, email, pass) {
  const variantes = [
    { usuario: email, contrasena: pass },
    { email, password: pass },
    { username: email, password: pass },
    { usuario: email, contraseña: pass },
    { mail: email, contrasena: pass },
  ];

  let ultima401 = null;
  let ultima400Faltan = null;

  for (const body of variantes) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 401) { ultima401 = res; continue; }

    if (res.status === 400) {
      const err = await res.json().catch(() => ({}));
      const msg = (err?.mensaje || '').toLowerCase();
      if (msg.includes('faltan credenciales')) { ultima400Faltan = err; continue; }
      throw new Error(err?.mensaje || 'Solicitud inválida');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.mensaje || 'Error del servidor');
    }

    const data = await res.json().catch(() => {
      throw new Error('Respuesta inválida del servidor');
    });
    return data;
  }

  if (ultima401) {
    const err = await ultima401.json().catch(() => ({}));
    const e = new Error(err?.mensaje || 'Credenciales no válidas');
    e.kind = 'bad-credentials';
    throw e;
  }
  if (ultima400Faltan) {
    throw new Error(ultima400Faltan?.mensaje || 'Faltan credenciales');
  }
  throw new Error('No se pudo iniciar sesión');
}

const LoginPage = ({ onVolver, onLoginSuccess }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [mensajeLogin, setMensajeLogin] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMensajeLogin('');
    setCargando(true);

    try {
      let tipo = 'deportista';
      let data;

      try {
        data = await tryLogin(`${API_BASE}/deportistas/login`, loginEmail, loginPassword);
      } catch (_e1) {
        tipo = 'entrenador';
        data = await tryLogin(`${API_BASE}/entrenadores/login`, loginEmail, loginPassword);
      }

      // Normalizo SIEMPRE un objeto usuario válido
      const bruto =
        data?.deportista || data?.entrenador || data?.user || data?.usuario || data || {};
      const usuario = (bruto && typeof bruto === 'object') ? { ...bruto } : {};

      // Si falta email, lo completo con lo que el usuario escribió en el input
      if (!usuario.email && typeof loginEmail === 'string') {
        usuario.email = loginEmail;
      }

      localStorage.setItem('tipo', tipo);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      onLoginSuccess?.({ tipo, usuario });
    } catch (err) {
      console.error(err);
      setMensajeLogin(err.message || 'Error al iniciar sesión');
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

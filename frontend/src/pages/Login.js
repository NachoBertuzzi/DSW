import React, { useState } from 'react';
import './styles/login.css';
import logo from '../assets/logo.png';
import { API_URL } from '../services/api';

function decodeToken(token) {
  const payload = token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
  return JSON.parse(json);
}

async function tryLogin(url, email, pass) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: email, contrasena: pass }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    const error = new Error(data?.mensaje || 'Credenciales no válidas');
    error.kind = 'bad-credentials';
    throw error;
  }

  if (!res.ok) {
    throw new Error(data?.mensaje || 'Error del servidor');
  }

  return data;
}

const LoginPage = ({ onLoginSuccess, onIrRegistro }) => {
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
        data = await tryLogin(`${API_URL}/deportistas/login`, loginEmail, loginPassword);
      } catch (errorDeportista) {
        if (errorDeportista.kind !== 'bad-credentials') throw errorDeportista;
        tipo = 'entrenador';
        data = await tryLogin(`${API_URL}/entrenadores/login`, loginEmail, loginPassword);
      }

      const usuario = decodeToken(data.token);

      if (!usuario.email && typeof loginEmail === 'string') {
        usuario.email = loginEmail;
      }

      localStorage.setItem('tipo', tipo);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      localStorage.setItem('token', data.token);

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

        <div style={{ marginTop: 15 }}>
          <small>¿No tenés cuenta?</small>{' '}
          <button
            onClick={onIrRegistro}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Registrate
          </button>
        </div>

        {mensajeLogin && <div className="login-message">{mensajeLogin}</div>}
      </div>
    </div>
  );
};

export default LoginPage;
import React, { useState } from 'react';

const LoginPage = ({ onVolver }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTipo, setLoginTipo] = useState('deportista');
  const [mensajeLogin, setMensajeLogin] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMensajeLogin('');
    const urlBase = 'http://localhost:3000/api';
    const urlLogin =
      loginTipo === 'deportista'
        ? `${urlBase}/deportistas/login`
        : `${urlBase}/entrenadores/login`;

    try {
      const response = await fetch(urlLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: loginEmail,
          contraseña: loginPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMensajeLogin(
          'Usuario encontrado: ' +
            (data.deportista?.usuario || data.entrenador?.usuario || loginEmail)
        );
      } else {
        const err = await response.json();
        setMensajeLogin('Error: ' + (err.mensaje || 'Credenciales incorrectas'));
      }
    } catch (error) {
      setMensajeLogin('Error de conexión con el servidor');
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
        <div>
          <label>Tipo de usuario: </label>
          <select
            value={loginTipo}
            onChange={(e) => setLoginTipo(e.target.value)}
            required
          >
            <option value="deportista">Deportista</option>
            <option value="entrenador">Entrenador</option>
          </select>
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

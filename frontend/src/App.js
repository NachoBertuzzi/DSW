import React, { useState } from 'react';

function App() {
  const [pantalla, setPantalla] = useState('inicio');

  // --- LOGIN ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTipo, setLoginTipo] = useState('deportista');
  const [mensajeLogin, setMensajeLogin] = useState('');

  // --- REGISTRO ---
  const [regTipo, setRegTipo] = useState('deportista');
  const [regDni, setRegDni] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAltura, setRegAltura] = useState('');
  const [regPeso, setRegPeso] = useState('');
  const [regEspecialidad, setRegEspecialidad] = useState('');
  const [mensajeRegistro, setMensajeRegistro] = useState('');

  const handleVolver = () => {
    setPantalla('inicio');
    setMensajeLogin('');
    setMensajeRegistro('');
    setLoginEmail('');
    setLoginPassword('');
    setLoginTipo('deportista');
    setRegTipo('deportista');
    setRegDni('');
    setRegNombre('');
    setRegApellido('');
    setRegUsuario('');
    setRegEmail('');
    setRegPassword('');
    setRegAltura('');
    setRegPeso('');
    setRegEspecialidad('');
  };

  // --- LOGIN ---
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

  // --- REGISTRO ---
  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setMensajeRegistro('');

    const urlBase = 'http://localhost:3000/api';
    const urlRegistro =
      regTipo === 'deportista'
        ? `${urlBase}/deportistas`
        : `${urlBase}/entrenadores`;

    const payload = {
      dni: Number(regDni),
      nombre: regNombre,
      apellido: regApellido,
      usuario: regUsuario,
      contraseña: regPassword,
      ...(regTipo === 'deportista'
        ? {
            altura: Number(regAltura),
            peso: Number(regPeso),
          }
        : {
            especialidad: regEspecialidad,
          }),
    };

    try {
      const response = await fetch(urlRegistro, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMensajeRegistro('Registro exitoso! Ya podés iniciar sesión.');
        handleVolver();
      } else {
        const errorData = await response.json();
        setMensajeRegistro('Error: ' + (errorData.mensaje || 'No se pudo registrar'));
      }
    } catch (error) {
      setMensajeRegistro('Error de conexión con el servidor');
      console.error(error);
    }
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      {pantalla === 'inicio' && (
        <>
          <h1>Bienvenido</h1>
          <button onClick={() => setPantalla('login')} style={{ marginRight: 10 }}>
            Iniciar Sesión
          </button>
          <button onClick={() => setPantalla('registro')}>Registrarse</button>
        </>
      )}

      {pantalla === 'login' && (
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
          <button onClick={handleVolver} style={{ marginTop: 10 }}>
            Volver
          </button>
          {mensajeLogin && <p>{mensajeLogin}</p>}
        </div>
      )}

      {pantalla === 'registro' && (
        <div>
          <h2>Registrarse</h2>
          <form onSubmit={handleRegistroSubmit}>
            <div>
              <label>DNI: </label>
              <input
                type="number"
                required
                value={regDni}
                onChange={(e) => setRegDni(e.target.value)}
              />
            </div>
            <div>
              <label>Nombre: </label>
              <input
                type="text"
                required
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
              />
            </div>
            <div>
              <label>Apellido: </label>
              <input
                type="text"
                required
                value={regApellido}
                onChange={(e) => setRegApellido(e.target.value)}
              />
            </div>
            <div>
              <label>Nombre de usuario: </label>
              <input
                type="text"
                required
                value={regUsuario}
                onChange={(e) => setRegUsuario(e.target.value)}
              />
            </div>
            <div>
              <label>Email: </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Contraseña: </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Tipo de usuario: </label>
              <select
                value={regTipo}
                onChange={(e) => setRegTipo(e.target.value)}
                required
              >
                <option value="deportista">Deportista</option>
                <option value="entrenador">Entrenador</option>
              </select>
            </div>

            {regTipo === 'deportista' && (
              <>
                <div>
                  <label>Altura (cm): </label>
                  <input
                    type="number"
                    required
                    value={regAltura}
                    onChange={(e) => setRegAltura(e.target.value)}
                  />
                </div>
                <div>
                  <label>Peso (kg): </label>
                  <input
                    type="number"
                    required
                    value={regPeso}
                    onChange={(e) => setRegPeso(e.target.value)}
                  />
                </div>
              </>
            )}

            {regTipo === 'entrenador' && (
              <div>
                <label>Especialidad: </label>
                <input
                  type="text"
                  required
                  value={regEspecialidad}
                  onChange={(e) => setRegEspecialidad(e.target.value)}
                />
              </div>
            )}

            <button type="submit">Registrarse</button>
          </form>
          <button onClick={handleVolver} style={{ marginTop: 10 }}>
            Volver
          </button>
          {mensajeRegistro && <p>{mensajeRegistro}</p>}
        </div>
      )}
    </div>
  );
}

export default App;

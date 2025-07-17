import React, { useState } from 'react';

const RegistroPage = ({ onVolver }) => {
  const [regTipo, setRegTipo] = useState('deportista');
  const [regDni, setRegDni] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');
  const [regAltura, setRegAltura] = useState('');
  const [regPeso, setRegPeso] = useState('');
  const [regEspecialidad, setRegEspecialidad] = useState('');
  const [regLocalidad, setRegLocalidad] = useState('');
  const [mensajeRegistro, setMensajeRegistro] = useState('');

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
      email: regEmail,
      contraseña: regPassword,
      fecha_nacimiento: regFechaNacimiento,
      ...(regTipo === 'deportista'
        ? {
            altura: Number(regAltura),
            peso: Number(regPeso),
            localidad_nombre: regLocalidad.trim(),
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
        onVolver();
      } else {
        const errorData = await response.json();
        setMensajeRegistro(
          'Error: ' + (errorData.mensaje || 'No se pudo registrar')
        );
      }
    } catch (error) {
      setMensajeRegistro('Error de conexión con el servidor');
      console.error(error);
    }
  };

  return (
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
          <label>Fecha de Nacimiento: </label>
          <input
            type="date"
            required
            value={regFechaNacimiento}
            onChange={(e) => setRegFechaNacimiento(e.target.value)}
          />
        </div>

        {/* BOTONES PARA ELEGIR TIPO DE USUARIO */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label>Tipo de usuario: </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
            <button
              type="button"
              onClick={() => setRegTipo('deportista')}
              style={{
                padding: '6px 12px',
                backgroundColor: regTipo === 'deportista' ? '#1976d2' : '#e0e0e0',
                color: regTipo === 'deportista' ? 'white' : 'black',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Deportista
            </button>
            <button
              type="button"
              onClick={() => setRegTipo('entrenador')}
              style={{
                padding: '6px 12px',
                backgroundColor: regTipo === 'entrenador' ? '#1976d2' : '#e0e0e0',
                color: regTipo === 'entrenador' ? 'white' : 'black',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Entrenador
            </button>
          </div>
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
            <div>
              <label>Localidad: </label>
              <input
                type="text"
                required
                value={regLocalidad}
                onChange={(e) => setRegLocalidad(e.target.value)}
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

        <button type="submit" style={{ marginTop: 15 }}>
          Registrarse
        </button>
      </form>
      <button onClick={onVolver} style={{ marginTop: 10 }}>
        Volver
      </button>
      {mensajeRegistro && <p>{mensajeRegistro}</p>}
    </div>
  );
};

export default RegistroPage;

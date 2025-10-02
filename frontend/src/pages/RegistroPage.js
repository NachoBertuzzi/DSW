import React, { useState } from 'react';
import '../pages/RegistroPage.css';
import logo from '../assets/logo.png';

// Función para validar formato de email usando una expresión regular
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const RegistroPage = ({ onVolver }) => {
  const [regTipo, setRegTipo] = useState('deportista');
  const [regDni, setRegDni] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState(''); // se usará "contrasena"
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');
  
  // Campos para deportista
  const [regAltura, setRegAltura] = useState('');
  const [regPeso, setRegPeso] = useState('');
  // Se piden tres campos para la localidad: código postal, nombre y provincia
  const [regLocalidadCodPostal, setRegLocalidadCodPostal] = useState('');
  const [regLocalidadNombre, setRegLocalidadNombre] = useState('');
  const [regLocalidadProvincia, setRegLocalidadProvincia] = useState('');
  
  // Campo para entrenador
  const [regEspecialidad, setRegEspecialidad] = useState('');
  
  const [mensajeRegistro, setMensajeRegistro] = useState('');

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setMensajeRegistro('');

    // Validación de formato del email
    if (!validateEmail(regEmail)) {
      setMensajeRegistro('Error: El mail no tiene un formato válido.');
      return;
    }
    
    const urlBase = 'http://localhost:3000/api';
    const urlRegistro =
      regTipo === 'deportista'
        ? `${urlBase}/deportistas`
        : `${urlBase}/entrenadores`;

    const payload = {
      dni: Number(regDni),
      nombre: regNombre,
      apellido: regApellido,
      usuario: regUsuario, // este campo será único
      email: regEmail,
      contrasena: regPassword, // siempre se usa "contrasena"
      fecha_nacimiento: regFechaNacimiento,
      ...(regTipo === 'deportista'
        ? {
            altura: Number(regAltura),
            peso: Number(regPeso),
            localidadCodPostal: regLocalidadCodPostal.toString().trim(),
            localidadNombre: regLocalidadNombre.trim(),
            localidadProvincia: regLocalidadProvincia.trim(),
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
    <div className="register-container">
      <div className="register-box">
        <img src={logo} alt="logo" className="register-logo" />
        <h2>Registrarse</h2>
        <form onSubmit={handleRegistroSubmit}>
          <label>DNI:</label>
          <input
            type="number"
            required
            value={regDni}
            onChange={(e) => setRegDni(e.target.value)}
          />
          
          <label>Nombre:</label>
          <input
            type="text"
            required
            value={regNombre}
            onChange={(e) => setRegNombre(e.target.value)}
          />
          
          <label>Apellido:</label>
          <input
            type="text"
            required
            value={regApellido}
            onChange={(e) => setRegApellido(e.target.value)}
          />
          
          <label>Nombre de usuario:</label>
          <input
            type="text"
            required
            value={regUsuario}
            onChange={(e) => setRegUsuario(e.target.value)}
          />
          
          <label>Email:</label>
          <input
            type="email"
            required
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
          />
          
          <label>Contraseña:</label>
          <input
            type="password"
            required
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
          />
          
          <label>Fecha de Nacimiento:</label>
          <input
            type="date"
            required
            value={regFechaNacimiento}
            onChange={(e) => setRegFechaNacimiento(e.target.value)}
          />

          {regTipo === 'deportista' && (
            <>
              <label>Altura (cm):</label>
              <input
                type="number"
                required
                value={regAltura}
                onChange={(e) => setRegAltura(e.target.value)}
              />
              
              <label>Peso (kg):</label>
              <input
                type="number"
                required
                value={regPeso}
                onChange={(e) => setRegPeso(e.target.value)}
              />
              
              <label>Localidad - Código Postal:</label>
              <input
                type="number"
                required
                value={regLocalidadCodPostal}
                onChange={(e) => setRegLocalidadCodPostal(e.target.value)}
              />
              
              <label>Localidad - Nombre:</label>
              <input
                type="text"
                required
                value={regLocalidadNombre}
                onChange={(e) => setRegLocalidadNombre(e.target.value)}
              />
              
              <label>Localidad - Provincia:</label>
              <input
                type="text"
                required
                value={regLocalidadProvincia}
                onChange={(e) => setRegLocalidadProvincia(e.target.value)}
              />
            </>
          )}

          {regTipo === 'entrenador' && (
            <>
              <label>Especialidad:</label>
              <input
                type="text"
                required
                value={regEspecialidad}
                onChange={(e) => setRegEspecialidad(e.target.value)}
              />
            </>
          )}

          <button type="submit">
            Registrarse
          </button>
        </form>
        <button onClick={onVolver} className="volver-btn">
          Volver
        </button>
        {mensajeRegistro && (
          <div className="register-message">{mensajeRegistro}</div>
        )}
      </div>
    </div>
  );
};

export default RegistroPage;
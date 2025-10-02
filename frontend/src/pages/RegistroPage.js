import React, { useState } from 'react';
import '../pages/RegistroPage.css';
import logo from '../assets/logo.png';

// Función para validar formato de email usando una expresión regular
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const RegistroPage = ({ onVolver }) => {
  // Tipo de usuario: 'deportista' o 'entrenador'
  const [regTipo, setRegTipo] = useState('deportista');
  // Control de páginas en el formulario: 1, 2 o 3
  const [step, setStep] = useState(1);

  // Campos comunes (página 1)
  const [regUsuario, setRegUsuario] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Campos comunes (página 2)
  const [regDni, setRegDni] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');
  
  // Campos adicionales para deportista (página 2)
  const [regAltura, setRegAltura] = useState('');
  const [regPeso, setRegPeso] = useState('');
  
  // Página 3 para deportista: Localidad
  const [regLocalidadCodPostal, setRegLocalidadCodPostal] = useState('');
  const [regLocalidadNombre, setRegLocalidadNombre] = useState('');
  const [regLocalidadProvincia, setRegLocalidadProvincia] = useState('');
  
  // Página 3 para entrenador: Especialidad
  const [regEspecialidad, setRegEspecialidad] = useState('');
  
  const [mensajeRegistro, setMensajeRegistro] = useState('');

  const handleNext = (e) => {
    e.preventDefault();
    // Aquí podrías agregar validaciones por página
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setMensajeRegistro('');

    // Validación del email (campo de la página 1)
    if (!validateEmail(regEmail)) {
      setMensajeRegistro('Error: El mail no tiene un formato válido.');
      return;
    }
    
    const urlBase = 'http://localhost:3000/api';
    const urlRegistro =
      regTipo === 'deportista'
        ? `${urlBase}/deportistas`
        : `${urlBase}/entrenadores`;

    // Construir payload con todos los campos
    let payload = {
      usuario: regUsuario,
      email: regEmail,
      contrasena: regPassword,
      dni: Number(regDni),
      nombre: regNombre,
      apellido: regApellido,
      fecha_nacimiento: regFechaNacimiento,
    };

    if (regTipo === 'deportista') {
      payload = {
        ...payload,
        altura: Number(regAltura),
        peso: Number(regPeso),
        localidadCodPostal: regLocalidadCodPostal.toString().trim(),
        localidadNombre: regLocalidadNombre.trim(),
        localidadProvincia: regLocalidadProvincia.trim(),
      };
    } else {
      payload = {
        ...payload,
        especialidad: regEspecialidad,
      };
    }

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

  // Indicador de progreso: tres puntitos
  const renderProgress = () => {
    return (
      <div className="progress-dots" style={{ marginBottom: '20px' }}>
        {[1, 2, 3].map(num => (
          <span
            key={num}
            style={{
              display: 'inline-block',
              width: num === step ? '16px' : '10px',
              height: num === step ? '16px' : '10px',
              borderRadius: '50%',
              backgroundColor: num === step ? '#e63946' : '#fff',
              margin: '0 5px',
              transition: 'all 0.3s ease'
            }}
          ></span>
        ))}
      </div>
    );
  };

  // Render por página
  const renderStepFields = () => {
    if (step === 1) {
      // Página 1: Selección de tipo y datos básicos (nombre de usuario, email, contraseña)
      return (
        <>
          <div className="user-type-container">
            <label>Tipo de usuario:</label>
            <div className="user-type-buttons">
              <button
                type="button"
                onClick={() => setRegTipo('deportista')}
                className={regTipo === 'deportista' ? 'active' : ''}
              >
                Deportista
              </button>
              <button
                type="button"
                onClick={() => setRegTipo('entrenador')}
                className={regTipo === 'entrenador' ? 'active' : ''}
              >
                Entrenador
              </button>
            </div>
          </div>
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
        </>
      );
    } else if (step === 2) {
      // Página 2: Datos comunes (DNI, Nombre, Apellido, Fecha de Nacimiento) y datos extra para deportista
      return (
        <>
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
            </>
          )}
        </>
      );
    } else if (step === 3) {
      // Página 3: Datos finales según tipo de usuario
      return regTipo === 'deportista' ? (
        <>
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
      ) : (
        <>
          <label>Especialidad:</label>
          <input
            type="text"
            required
            value={regEspecialidad}
            onChange={(e) => setRegEspecialidad(e.target.value)}
          />
        </>
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <img src={logo} alt="logo" className="register-logo" />
        <h2>Registrarse</h2>
        {renderProgress()}
        <form onSubmit={ step === 3 ? handleRegistroSubmit : handleNext }>
          {renderStepFields()}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            {step > 1 && (
              <button type="button" onClick={handleBack}>
                Volver
              </button>
            )}
            <button type="submit">
              {step === 3 ? 'Registrarse' : 'Siguiente'}
            </button>
          </div>
        </form>
        <button onClick={onVolver} className="volver-btn" style={{ marginTop: '10px' }}>
          Cancelar
        </button>
        {mensajeRegistro && (
          <div className="register-message">{mensajeRegistro}</div>
        )}
      </div>
    </div>
  );
};

export default RegistroPage;
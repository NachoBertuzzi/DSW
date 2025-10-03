import React, { useState } from 'react';
import './styles/RegistroPage.css';
import logo from '../assets/logo.png';

// Validación de email
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const RegistroPage = ({ onVolver }) => {
  // Tipo de usuario: 'deportista' o 'entrenador'
  const [regTipo, setRegTipo] = useState('deportista');

  // Control de “pasos”: 1, 2, 3 y 4 (éxito)
  const [step, setStep] = useState(1);

  // Página 1
  const [regUsuario, setRegUsuario] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Página 2
  const [regDni, setRegDni] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');

  // Deportista extra (página 2)
  const [regAltura, setRegAltura] = useState('');
  const [regPeso, setRegPeso] = useState('');

  // Página 3 – Localidad (deportista) o Especialidad (entrenador)
  const [regLocalidadCodPostal, setRegLocalidadCodPostal] = useState('');
  const [regLocalidadNombre, setRegLocalidadNombre] = useState('');
  const [regLocalidadProvincia, setRegLocalidadProvincia] = useState('');
  const [regEspecialidad, setRegEspecialidad] = useState('');

  // Mensaje de error / info
  const [mensajeRegistro, setMensajeRegistro] = useState('');

  // Datos para la pantalla de éxito (step 4)
  const [successInfo, setSuccessInfo] = useState(null); // { tipo, nombre, email }

  const handleNext = (e) => {
    e.preventDefault();
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setMensajeRegistro('');

    if (!validateEmail(regEmail)) {
      setMensajeRegistro('Error: el mail no tiene un formato válido.');
      return;
    }

    const urlBase =
  (import.meta?.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:3000/api';
    const urlRegistro =
      regTipo === 'deportista'
        ? `${urlBase}/deportistas`
        : `${urlBase}/entrenadores`;

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
      payload = { ...payload, especialidad: regEspecialidad };
    }

    try {
      const res = await fetch(urlRegistro, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (res.ok) {
        const creado = json?.data || {};
        // Mostramos pantalla de éxito (antes del login)
        setSuccessInfo({
          tipo: regTipo,
          nombre: creado?.nombre || regNombre || '',
          email: creado?.email || creado?.usuario || regEmail || '',
        });
        setStep(4);

        // Si además querés mostrar un cartel en el menú después del login,
        // descomentá esto:
        // localStorage.setItem('justCreated', JSON.stringify({
        //   tipo: regTipo,
        //   nombre: creado?.nombre || regNombre || '',
        //   email: creado?.email || creado?.usuario || regEmail || '',
        // }));
      } else {
        setMensajeRegistro('Error: ' + (json?.mensaje || 'No se pudo registrar'));
      }
    } catch (error) {
      setMensajeRegistro('Error de conexión con el servidor');
      console.error(error);
    }
  };

  const renderProgress = () => (
    <div className="progress-dots" style={{ marginBottom: '20px' }}>
      {[1, 2, 3].map((num) => (
        <span
          key={num}
          style={{
            display: 'inline-block',
            width: num === step ? '16px' : '10px',
            height: num === step ? '16px' : '10px',
            borderRadius: '50%',
            backgroundColor: num === step ? '#e63946' : '#fff',
            margin: '0 5px',
            transition: 'all 0.3s ease',
            visibility: step === 4 ? 'hidden' : 'visible',
          }}
        />
      ))}
    </div>
  );

  const renderStepFields = () => {
    if (step === 1) {
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
    }

    if (step === 2) {
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
    }

    if (step === 3) {
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

    // Step 4: ÉXITO
    if (step === 4) {
      const tipoBonito =
        successInfo?.tipo === 'entrenador' ? 'Entrenador'
        : successInfo?.tipo === 'deportista' ? 'Deportista'
        : 'Usuario';

      return (
        <div style={{ textAlign: 'center', padding: '10px 4px' }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px',
              background: '#e8f5e9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 34, color: '#2e7d32'
            }}
          >
            ✓
          </div>
          <h3 style={{ margin: '8px 0' }}>{tipoBonito} creado exitosamente</h3>
          <p style={{ margin: 0, opacity: 0.85 }}>
            {successInfo?.nombre ? <><strong>{successInfo.nombre}</strong><br/></> : null}
            {successInfo?.email}
          </p>

          <div style={{ height: 14 }} />

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button type="button" onClick={onVolver}>Ir a iniciar sesión</button>
          </div>

          <div style={{ marginTop: 12, opacity: 0.75, fontSize: 13 }}>
            Consejo: guardá tu usuario y contraseña en un lugar seguro.
          </div>
        </div>
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <img src={logo} alt="logo" className="register-logo" />
        <h2>{step === 4 ? 'Registro' : 'Registrarse'}</h2>

        {renderProgress()}

        {step === 4 ? (
          // En el paso 4 solo mostramos la pantalla de éxito
          renderStepFields()
        ) : (
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
        )}

        {step !== 4 && (
          <>
            <button onClick={onVolver} className="volver-btn" style={{ marginTop: '10px' }}>
              Cancelar
            </button>
            {mensajeRegistro && (
              <div className="register-message">{mensajeRegistro}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegistroPage;

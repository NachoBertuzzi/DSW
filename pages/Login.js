import { useState } from 'react';

function Login({ volver }) {
  const [tipoUsuario, setTipoUsuario] = useState('deportista'); // 'deportista' o 'entrenador'
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    // Endpoint según tipo
    const endpoint = tipoUsuario === 'deportista' 
      ? 'http://localhost:3000/api/deportistas/login' 
      : 'http://localhost:3000/api/entrenadores/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contraseña }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Sesión iniciada correctamente');
        // Aquí podés guardar token o redireccionar
      } else {
        alert(data.mensaje || data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error de conexión');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 320, margin: 'auto' }}>
      <h2>Iniciar Sesión</h2>

      <label>
        <input
          type="radio"
          value="deportista"
          checked={tipoUsuario === 'deportista'}
          onChange={() => setTipoUsuario('deportista')}
        />{' '}
        Deportista
      </label>{' '}

      <label>
        <input
          type="radio"
          value="entrenador"
          checked={tipoUsuario === 'entrenador'}
          onChange={() => setTipoUsuario('entrenador')}
        />{' '}
        Entrenador
      </label>

      <br /><br />

      <input
        type="text"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        required
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={(e) => setContraseña(e.target.value)}
        required
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <button type="submit" style={{ width: '100%', padding: '10px' }}>
        Ingresar
      </button>

      <br /><br />

      <button type="button" onClick={volver} style={{ width: '100%', padding: '10px' }}>
        Volver
      </button>
    </form>
  );
}

export default Login;


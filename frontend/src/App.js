import React, { useState } from 'react';
import LoginPage from './pages/Login';
import RegistroPage from './pages/RegistroPage';

function App() {
  const [pantalla, setPantalla] = useState('inicio');

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

      {pantalla === 'login' && <LoginPage onVolver={() => setPantalla('inicio')} />}

      {pantalla === 'registro' && <RegistroPage onVolver={() => setPantalla('inicio')} />}
    </div>
  );
}

export default App;

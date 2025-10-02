import React, { useState, useEffect } from 'react';
import LoginPage from './pages/Login';
import RegistroPage from './pages/RegistroPage';
import MenuDeportista from './pages/MenuDeportista';
import MenuEntrenador from './pages/MenuEntrenador';
import './App.css';
import './pages/inicio.css';
import logo from './assets/logo.png';

function App() {
  const [pantalla, setPantalla] = useState('inicio');

  // Si el usuario ya tenía sesión guardada, lo mando directo a su menú
  useEffect(() => {
    const tipo = localStorage.getItem('tipo');
    if (tipo === 'deportista') setPantalla('menu-deportista');
    if (tipo === 'entrenador') setPantalla('menu-entrenador');
  }, []);

  const handleLoginSuccess = ({ tipo }) => {
    if (tipo === 'deportista') setPantalla('menu-deportista');
    if (tipo === 'entrenador') setPantalla('menu-entrenador');
  };

  const handleLogout = () => {
    localStorage.removeItem('tipo');
    localStorage.removeItem('usuario');
    setPantalla('inicio');
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      {pantalla === 'inicio' && (
        <div className="inicio-container">
          <div className="inicio-box">
            <img src={logo} alt="logo" className="inicio-logo" />
            <h1 className="inicio-title">Bienvenido</h1>
            <div className="inicio-buttons">
              <button onClick={() => setPantalla('login')}>Iniciar Sesión</button>
              <button onClick={() => setPantalla('registro')}>Registrarse</button>
            </div>
          </div>
        </div>
      )}

      {pantalla === 'login' && (
        <LoginPage
          onVolver={() => setPantalla('inicio')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {pantalla === 'registro' && (
        <RegistroPage onVolver={() => setPantalla('inicio')} />
      )}

      {pantalla === 'menu-deportista' && (
        <MenuDeportista onLogout={handleLogout} />
      )}

      {pantalla === 'menu-entrenador' && (
        <MenuEntrenador onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
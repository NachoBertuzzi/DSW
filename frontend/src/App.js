import React, { useState, useEffect } from 'react';
import LoginPage from './pages/Login';
import RegistroPage from './pages/RegistroPage';
import MenuDeportista from './pages/MenuDeportista';
import MenuEntrenador from './pages/MenuEntrenador';
import './App.css';
import './pages/styles/inicio.css';
import logo from './assets/logo.png';

function App() {
  const [pantalla, setPantalla] = useState('login'); 

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
    setPantalla('login'); 
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      {pantalla === 'login' && (
        <LoginPage
          onIrRegistro={() => setPantalla('registro')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {pantalla === 'registro' && (
        <RegistroPage onVolver={() => setPantalla('login')} /> 
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

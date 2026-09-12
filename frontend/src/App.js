import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegistroPage from './pages/RegistroPage';
import MenuDeportista from './pages/MenuDeportista';
import MenuEntrenador from './pages/MenuEntrenador';
import './App.css';
import './pages/styles/inicio.css';

function RutaProtegida({ tipo, children }) {
  return localStorage.getItem('tipo') === tipo
    ? children
    : <Navigate to="/login" replace />;
}

function RutasDeLaApp() {
  const navigate = useNavigate();

  const handleLoginSuccess = ({ tipo }) => {
    navigate(tipo === 'deportista' ? '/deportista' : '/entrenador');
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('tipo');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <LoginPage
              onIrRegistro={() => navigate('/registro')}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />
        <Route
          path="/registro"
          element={<RegistroPage onVolver={() => navigate('/login')} />}
        />
        <Route
          path="/deportista"
          element={
            <RutaProtegida tipo="deportista">
              <MenuDeportista onLogout={handleLogout} />
            </RutaProtegida>
          }
        />
        <Route
          path="/entrenador"
          element={
            <RutaProtegida tipo="entrenador">
              <MenuEntrenador onLogout={handleLogout} />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RutasDeLaApp />
    </BrowserRouter>
  );
}

export default App;

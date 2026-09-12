import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegistroPage from './pages/RegistroPage';
import MenuDeportista from './pages/MenuDeportista';
import MenuEntrenador from './pages/MenuEntrenador';
import Agregar from './pages/deportista/Agregar';
import Historial from './pages/deportista/Historial';
import TuEntrenador from './pages/deportista/TuEntrenador';
import PerfilDeportista from './pages/deportista/Perfil';
import AsignarEntrenamiento from './pages/entrenador/AsignarEntrenamiento';
import HistorialEntrenador from './pages/entrenador/HistorialEntrenador';
import TusDeportistas from './pages/entrenador/TusDeportistas';
import PerfilEntrenador from './pages/entrenador/Perfil';
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
        >
          <Route path="agregar" element={<Agregar onVolver={() => navigate('/deportista')} />} />
          <Route path="historial" element={<Historial onVolver={() => navigate('/deportista')} />} />
          <Route path="entrenador" element={<TuEntrenador onVolver={() => navigate('/deportista')} />} />
          <Route path="perfil" element={<PerfilDeportista onVolver={() => navigate('/deportista')} onLogout={handleLogout} />} />
        </Route>
        <Route
          path="/entrenador"
          element={
            <RutaProtegida tipo="entrenador">
              <MenuEntrenador onLogout={handleLogout} />
            </RutaProtegida>
          }
        >
          <Route path="asignar" element={<AsignarEntrenamiento onVolver={() => navigate('/entrenador')} />} />
          <Route path="historial" element={<HistorialEntrenador onVolver={() => navigate('/entrenador')} />} />
          <Route path="deportistas" element={<TusDeportistas onVolver={() => navigate('/entrenador')} />} />
          <Route path="perfil" element={<PerfilEntrenador onVolver={() => navigate('/entrenador')} onLogout={handleLogout} />} />
        </Route>
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

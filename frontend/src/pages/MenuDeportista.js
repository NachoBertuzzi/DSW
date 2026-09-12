import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SuccessCreated from './SuccessCreated';
import CoachChat from '../components/CoachChat';
import Card from '../components/Card';
import './styles/MenuDeportista.css';

function MenuDeportista({ onLogout }) {
	const [menuAbierto, setMenuAbierto] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const esInicio = location.pathname === '/deportista';
	const usuario = useMemo(() => {
		try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
	}, []);

	return (
		<div className="menu-screen">
			<h2>Menú principal</h2>
			<div className="success-block" style={{ pointerEvents: 'none' }}>
				<SuccessCreated />
			</div>

			<div className="header-actions">
				<small>{usuario?.nombre ? `Hola, ${usuario.nombre}` : ''}</small>
				<div className={`dropdown-header ${menuAbierto ? 'is-open' : ''}`}>
					<button type="button" className="hamburger-header" aria-expanded={menuAbierto} aria-label="Abrir menú de usuario" onClick={() => setMenuAbierto((abierto) => !abierto)}>&#9776;</button>
					<div className="dropdown-content-header">
						<button type="button" className="btn" onClick={() => { navigate('/deportista/perfil'); setMenuAbierto(false); }}>Ver mi perfil</button>
						<button type="button" className="btn btn-outline" onClick={() => { setMenuAbierto(false); onLogout(); }}>Cerrar sesión</button>
					</div>
				</div>
			</div>

			{esInicio ? (
				<div className="menu-grid">
					<Card title="Agregar entrenamiento" desc="Crear entrenamiento (propio o asignado)" onClick={() => navigate('/deportista/agregar')} />
					<Card title="Historial de entrenamientos" desc="Ver entrenamientos anteriores" onClick={() => navigate('/deportista/historial')} />
					<Card title="Tu entrenador" desc="Ver/Agregar/Cambiar entrenador" onClick={() => navigate('/deportista/entrenador')} />
				</div>
			) : <Outlet />}
			<CoachChat />
		</div>
	);
}

export default MenuDeportista;

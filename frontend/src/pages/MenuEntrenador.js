import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SuccessCreated from './SuccessCreated';
import Card from '../components/Card';
import './styles/MenuEntrenador.css';

function MenuEntrenador({ onLogout }) {
	const [menuAbierto, setMenuAbierto] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const esInicio = location.pathname === '/entrenador';
	const usuario = useMemo(() => {
		try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
	}, []);

	return (
		<div className="menu-screen coach">
			<SuccessCreated />
			<header className="menu-header">
				<h2>Menú principal</h2>
				<div className="header-actions">
					<small>{usuario?.nombre ? `Hola, ${usuario.nombre}` : ''}</small>
					<div className={`dropdown-header ${menuAbierto ? 'is-open' : ''}`}>
						<button type="button" className="hamburger-header" aria-expanded={menuAbierto} aria-label="Abrir menú de usuario" onClick={() => setMenuAbierto((abierto) => !abierto)}>☰</button>
						<div className="dropdown-content-header">
							<button onClick={() => { navigate('/entrenador/perfil'); setMenuAbierto(false); }}>Tu Perfil</button>
							<button onClick={() => { setMenuAbierto(false); onLogout(); }}>Cerrar sesión</button>
						</div>
					</div>
				</div>
			</header>

			{esInicio ? (
				<div className="menu-grid">
					<Card title="1) Asignar entrenamiento" desc="Crear y asignar entrenamientos" onClick={() => navigate('/entrenador/asignar')} />
					<Card title="2) Historial de entrenamientos" desc="Ver entrenamientos que asignaste" onClick={() => navigate('/entrenador/historial')} />
					<Card title="3) Tus deportistas" desc="Ver y dar de baja" onClick={() => navigate('/entrenador/deportistas')} />
				</div>
			) : <Outlet />}
		</div>
	);
}

export default MenuEntrenador;

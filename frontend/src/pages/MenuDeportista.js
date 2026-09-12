import React, { useState, useMemo } from 'react';
import SuccessCreated from './SuccessCreated';
import CoachChat from '../components/CoachChat';
import { Card } from '../components/MenuComponents';
import Agregar from './deportista/Agregar';
import Historial from './deportista/Historial';
import TuEntrenador from './deportista/TuEntrenador';
import Perfil from './deportista/Perfil';
import './styles/MenuDeportista.css';

function MenuDeportista({ onLogout }) {
	const [vista, setVista] = useState('home');
	const [menuAbierto, setMenuAbierto] = useState(false);
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
						<button type="button" className="btn" onClick={() => { setVista('perfil'); setMenuAbierto(false); }}>Ver mi perfil</button>
						<button type="button" className="btn btn-outline" onClick={() => { setMenuAbierto(false); onLogout(); }}>Cerrar sesión</button>
					</div>
				</div>
			</div>

			{vista === 'home' && (
				<div className="menu-grid">
					<Card title="Agregar entrenamiento" desc="Crear entrenamiento (propio o asignado)" onClick={() => setVista('agregar')} />
					<Card title="Historial de entrenamientos" desc="Ver entrenamientos anteriores" onClick={() => setVista('historial')} />
					<Card title="Tu entrenador" desc="Ver/Agregar/Cambiar entrenador" onClick={() => setVista('entrenador')} />
				</div>
			)}

			{vista === 'agregar' && <Agregar onVolver={() => setVista('home')} />}
			{vista === 'historial' && <Historial onVolver={() => setVista('home')} />}
			{vista === 'entrenador' && <TuEntrenador onVolver={() => setVista('home')} />}
			{vista === 'perfil' && <Perfil onVolver={() => setVista('home')} onLogout={onLogout} />}
			<CoachChat />
		</div>
	);
}

export default MenuDeportista;

import React, { useState, useMemo } from 'react';
import SuccessCreated from './SuccessCreated';
import { Card } from '../components/MenuComponents';
import AsignarEntrenamiento from './entrenador/AsignarEntrenamiento';
import HistorialEntrenador from './entrenador/HistorialEntrenador';
import TusDeportistas from './entrenador/TusDeportistas';
import Perfil from './entrenador/Perfil';
import './styles/MenuEntrenador.css';

function MenuEntrenador({ onLogout }) {
	const [vista, setVista] = useState('home');
	const [menuAbierto, setMenuAbierto] = useState(false);
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
							<button onClick={() => { setVista('perfil'); setMenuAbierto(false); }}>Tu Perfil</button>
							<button onClick={() => { setMenuAbierto(false); onLogout(); }}>Cerrar sesión</button>
						</div>
					</div>
				</div>
			</header>

			{vista === 'home' && (
				<div className="menu-grid">
					<Card title="1) Asignar entrenamiento" desc="Crear y asignar entrenamientos" onClick={() => setVista('asignar')} />
					<Card title="2) Historial de entrenamientos" desc="Ver entrenamientos que asignaste" onClick={() => setVista('historial')} />
					<Card title="3) Tus deportistas" desc="Ver y dar de baja" onClick={() => setVista('deportistas')} />
				</div>
			)}

			{vista === 'asignar' && <AsignarEntrenamiento onVolver={() => setVista('home')} />}
			{vista === 'historial' && <HistorialEntrenador onVolver={() => setVista('home')} />}
			{vista === 'deportistas' && <TusDeportistas onVolver={() => setVista('home')} />}
			{vista === 'perfil' && <Perfil onVolver={() => setVista('home')} onLogout={onLogout} />}
		</div>
	);
}

export default MenuEntrenador;

import React, { useState, useMemo } from 'react';
import { API_URL } from '../../services/api';
import { Back } from '../../components/MenuComponents';
import '../styles/MenuEntrenador.css';

function Perfil({ onVolver, onLogout }) {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) ?? {};
    } catch {
      return {};
    }
  }, []);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const eliminarCuenta = async () => {
    if (eliminando) return;
    const confirmacion = window.confirm("¿Seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (!confirmacion) return;

    const contrasena = prompt("Por seguridad, ingresá tu contraseña:");
    if (!contrasena) return;

    setEliminando(true);
    setMensaje('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entrenadores/${usuario.dni}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ contrasena }),
      });
      const data = await res.json().catch(()=>({}));
      if (res.ok) {
        try {
          const coachDni = usuario?.dni;
          if (coachDni) {
            localStorage.removeItem(`coach:${coachDni}:deportistas`);
            for (const key of Object.keys(localStorage)) {
              if (!key.startsWith('athlete:') || !key.endsWith(':coach')) continue;
              const actual = JSON.parse(localStorage.getItem(key) || 'null');
              if (actual && String(actual.dni) === String(coachDni)) {
                localStorage.removeItem(key);
              }
            }
          }
        } catch {}

        if (typeof onLogout === "function") {
          onLogout();
          return;
        }
        localStorage.removeItem("tipo");
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        window.location.reload();
      } else {
        setMensaje(data.mensaje || "Error al eliminar la cuenta.");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión con el servidor.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tu perfil</h3>

      <div className="card-box">
        <p><strong>Nombre:</strong> {usuario?.nombre || "-"}</p>
        <p><strong>Email:</strong> {usuario?.email || "-"}</p>
      </div>

      <button className="btn btn-outline" disabled={eliminando} onClick={eliminarCuenta}>
        {eliminando ? 'Eliminando...' : 'Dar de baja cuenta'}
      </button>
      {mensaje && <p className="muted" role="status">{mensaje}</p>}
    </section>
  );
}

export default Perfil;
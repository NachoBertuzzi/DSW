import React, { useState, useEffect } from 'react';
import Back from '../../components/Back';
import { Entrenamientos, API_URL } from '../../services/api';
import '../styles/MenuDeportista.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

function Perfil({ onVolver, onLogout }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) ?? {};
    } catch {
      return {};
    }
  }, []);

  const [entrenamientos, setEntrenamientos] = useState([]);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState('');
  const [accion, setAccion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errorCarga, setErrorCarga] = useState('');
  const usuarioDni = usuario?.dni;

  useEffect(() => {
    if (!usuarioDni) return;
    (async () => {
      try {
        setErrorCarga('');
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/deportistas/${usuarioDni}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setErrorCarga('No se pudo cargar la información del perfil.');
          return;
        }
        const json = await res.json();
        const remoto = json?.data || null;
        if (!remoto) {
          setErrorCarga('No se pudo cargar la información del perfil.');
          return;
        }
        setUsuario((actual) => {
          const actualizado = { ...actual, ...remoto };
          delete actualizado.contrasena;
          localStorage.setItem('usuario', JSON.stringify(actualizado));
          return actualizado;
        });
      } catch (error) {
        console.error(error);
        setErrorCarga('No se pudo cargar la información del perfil.');
      }
    })();
  }, [usuarioDni]);

  useEffect(() => {
    (async () => {
      try {
        setErrorCarga('');
        const data = await Entrenamientos.listarTodos();
        setEntrenamientos((data?.data || [])
          .filter((ent) => String(ent?.deportista?.dni) === String(usuario?.dni))
          .map((ent) => ({ ...ent, ejercicios: ent.ejercicios || [] })));
      } catch (error) {
        console.error(error);
        setEntrenamientos([]);
        setErrorCarga('No se pudo cargar la información del perfil.');
      }
    })();
  }, [usuario?.dni]);

  const actualizarPeso = async () => {
    if (accion) return;
    let inputPeso = prompt("Ingresa tu nuevo peso (kg). Puedes usar decimales:", usuario?.peso ?? "");
    if (!inputPeso) return;

    const nuevoPeso = inputPeso.replace(',', '.').trim();

    if (isNaN(parseFloat(nuevoPeso))) {
      alert("Por favor, ingresa un número válido.");
      return;
    }

    setAccion('peso');
    setMensaje('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/deportistas/${usuario.dni}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ peso: parseFloat(nuevoPeso) }),
      });

      const data = await res.json();

      if (res.ok) {
        const actualizado = { ...usuario, peso: parseFloat(nuevoPeso) };
        localStorage.setItem("usuario", JSON.stringify(actualizado));
        setUsuario(actualizado);
        setMensaje("Peso actualizado correctamente.");
      } else {
        setMensaje(data.mensaje || "Error al actualizar el peso.");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setAccion('');
    }
  };

  const ejerciciosDisponibles = [
    ...new Set(
      entrenamientos.flatMap(entrenamiento =>
        (entrenamiento.ejercicios || [])
          .filter(ejercicio => !ejercicio.eliminado)
          .map(ejercicio => ejercicio.nombre)
      )
    )
  ].sort();

  const datosGrafico = entrenamientos
    .map(entrenamiento => {
      const ejercicio = (entrenamiento.ejercicios || []).find(
        ej =>
          !ej.eliminado &&
          ej.nombre === ejercicioSeleccionado
      );

      if (!ejercicio) return null;

      const pesos = (ejercicio.series || [])
        .map(serie => parseFloat(serie.peso))
        .filter(peso => Number.isFinite(peso));

      if (pesos.length === 0) return null;

      return {
        fecha: entrenamiento.fechaEntrenamiento,
        peso: Math.max(...pesos),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const darBajaCuenta = async () => {
    if (accion) return;
    if (!usuario?.dni) {
      alert("No se encontró información del usuario");
      return;
    }

    const contrasena = prompt("Ingresa tu contraseña para confirmar la baja de tu cuenta:");
    if (!contrasena) return;

    setAccion('baja');
    setMensaje('');
    try {
      const token = localStorage.getItem('token');
      const deleteRes = await fetch(`${API_URL}/deportistas/eliminar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ dni: usuario.dni, contrasena }),
      });

      if (deleteRes.ok) {
        localStorage.removeItem("usuario");
        localStorage.removeItem("historialPesos");
        onLogout();
      } else {
        const err = await deleteRes.json();
        setMensaje(err.mensaje || "Error eliminando la cuenta.");
      }
    } catch (e) {
      console.error(e);
      setMensaje("Error de conexión con el servidor.");
    } finally {
      setAccion('');
    }
  };

  return (
    <section className="panel perfil-panel">
      <Back onClick={onVolver} />
      <h3 className="perfil-titulo">Tu Perfil</h3>
      {errorCarga && (
        <p className="error-message" role="alert">
          {errorCarga}
        </p>
      )}

      <div className="perfil-card">
        <p><strong>Nombre:</strong> {usuario?.nombre ?? "-"}</p>
        <p><strong>Email:</strong> {usuario?.email ?? "-"}</p>

        <div className="perfil-peso">
          <p><strong>Peso actual:</strong> {usuario?.peso ?? "-"}</p>
          <button type="button" className="btn btn-sm btn-primary" disabled={accion === 'peso'} onClick={actualizarPeso}>
            {accion === 'peso' ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="grafico-box">
        <h4 className="grafico-titulo">Progreso por ejercicio</h4>

        {ejerciciosDisponibles.length === 0 ? (
          <p className="grafico-placeholder">
            Todavía no tenés ejercicios registrados en tu historial.
          </p>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label className="muted" style={{ marginRight: 10 }}>
                Ejercicio:
              </label>

              <select
                className="input"
                value={ejercicioSeleccionado}
                onChange={(e) => setEjercicioSeleccionado(e.target.value)}
              >
                <option value="">— Seleccioná un ejercicio —</option>

                {ejerciciosDisponibles.map(nombre => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>

            {!ejercicioSeleccionado ? (
              <p className="grafico-placeholder">
                Seleccioná un ejercicio para ver tu progreso.
              </p>
            ) : datosGrafico.length < 2 ? (
              <p className="grafico-placeholder">
                Necesitás al menos 2 entrenamientos con este ejercicio para visualizar tu progreso.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={datosGrafico}>
                  <XAxis dataKey="fecha" stroke="#ccc" />
                  <YAxis stroke="#ccc" unit=" kg" />
                  <Tooltip
                    formatter={(value) => [`${value} kg`, 'Mejor peso']}
                  />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#e63946"
                    strokeWidth={3}
                    dot={{ fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>

      <button type="button" className="btn btn-outline" disabled={accion === 'baja'} onClick={darBajaCuenta}>
        {accion === 'baja' ? 'Eliminando...' : 'Dar de baja la cuenta'}
      </button>
      {mensaje && <p className="muted" role="status">{mensaje}</p>}
    </section>
  );
}

export default Perfil;
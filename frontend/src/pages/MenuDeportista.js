import React, { useState, useMemo, useEffect } from 'react';
import SuccessCreated from './SuccessCreated';
import { Entrenamientos } from '../services/api';
import './styles/MenuDeportista.css';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

function MenuDeportista({ onLogout }) {
  const [vista, setVista] = useState('home'); // home | agregar | historial | entrenador | perfil
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
  }, []);

  return (
    <div className="menu-screen">
      {/* Wrappée SuccessCreated para evitar que su overlay bloquee clicks (temporal) */}
      <h2>Menú principal</h2>
      <div className="success-block" style={{ pointerEvents: 'none' }}>
        <SuccessCreated />
      </div>

      <div className="header-actions">
        <small>{usuario?.nombre ? `Hola, ${usuario.nombre}` : ''}</small>
        <div className="dropdown-header">
          <button type="button" className="hamburger-header">&#9776;</button>
          <div className="dropdown-content-header">
            <button type="button" className="btn" onClick={() => setVista('perfil')}>Ver mi perfil</button>
            <button type="button" className="btn btn-outline" onClick={onLogout}>Cerrar sesión</button>
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
      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} />}
    </div>
  );
}

/* ---------- Subvistas ---------- */

function Agregar({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);
  const [modo, setModo] = useState('propio'); // propio | asignado
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0,10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0,5));

  // builder propio
  const [query, setQuery] = useState('');
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [cantSeries, setCantSeries] = useState(1);
  const [enviando, setEnviando] = useState(false);

  // asignado (placeholder)
  const [asignados, setAsignados] = useState([]);
  useEffect(() => {
    if (modo === 'asignado') {
      const key = `assigned:${usuario?.dni}`;
      setAsignados(JSON.parse(localStorage.getItem(key) || '[]'));
    }
  }, [modo, usuario?.dni]);

  // agregar ejercicio
  const agregarEjercicio = () => {
    const n = nombre.trim();
    const g = grupo.trim();
    const series = Math.max(1, Number(cantSeries) || 1);
    if (!n) return alert('Poné un nombre de ejercicio');
    setEjercicios(p => [
      { id: crypto.randomUUID(), nombre: n, grupo: g, series: Array.from({length: series}, () => ({peso:'', reps:''})) },
      ...p,
    ]);
    setNombre(''); setGrupo(''); setCantSeries(1);
  };

  const setSerieValor = (idEj, idx, campo, valor) => {
    setEjercicios(p => p.map(e => e.id !== idEj ? e : ({
      ...e,
      series: e.series.map((s,i) => i===idx ? {...s, [campo]: valor} : s)
    })));
  };

  const eliminarEjercicio = (id) => setEjercicios(p => p.filter(e => e.id !== id));

  const ejerciciosFiltrados = query
    ? ejercicios.filter(e => (e.nombre + ' ' + (e.grupo||'')).toLowerCase().includes(query.toLowerCase()))
    : ejercicios;

  const terminar = async () => {
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (modo === 'propio' && ejercicios.length === 0) return alert('Agregá al menos un ejercicio');

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      deportista: usuario?.dni,
    };

    try {
      setEnviando(true);
      if (Entrenamientos?.crear) {
        await Entrenamientos.crear(payload);
      } else {
        const BASE = (import.meta?.env?.VITE_API_URL) || process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${BASE}/entrenamientos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('HTTP '+res.status);
      }

      const keyHist = `athlete:${usuario?.dni}:historial`;
      const prev = JSON.parse(localStorage.getItem(keyHist) || '[]');
      localStorage.setItem(keyHist, JSON.stringify([{ id: crypto.randomUUID(), fechaEntrenamiento: fecha, horaEntrenamiento: hora, ejercicios, origen: modo }, ...prev]));
      alert('Entrenamiento guardado');
      onVolver();
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar en el backend');
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = () => { if (window.confirm('¿Cancelar? Se perderán los cambios.')) onVolver(); };

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Agregar entrenamiento</h3>

      <div className="row gap">
        <button type="button" className={`btn ${modo==='propio'?'btn-primary':''}`} onClick={()=>setModo('propio')}>Opción 1: Propio</button>
        <button type="button" className={`btn ${modo==='asignado'?'btn-primary':''}`} onClick={()=>setModo('asignado')}>Opción 2: Asignado</button>
      </div>

      <div className="row gap">
        <input className="input" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
        <input className="input" type="time" value={hora} onChange={e=>setHora(e.target.value)} />
      </div>

      {modo === 'propio' ? (
        <>
          <div className="row gap">
            <input className="input" placeholder="Filtrar por nombre o grupo…" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>

          <div className="row gap wrap">
            <input className="input" placeholder="Nombre del ejercicio" value={nombre} onChange={e=>setNombre(e.target.value)} />
            <input className="input" placeholder="Grupo muscular" value={grupo} onChange={e=>setGrupo(e.target.value)} />
            <input className="input small" type="number" min={1} value={cantSeries} onChange={e=>setCantSeries(e.target.value)} placeholder="Cant. series" />
            <button type="button" className="btn btn-primary" onClick={agregarEjercicio}>Agregar</button>
          </div>

          {ejercicios.length === 0 && <p className="muted">Lista de ejercicios (vacía). Agregá el primero.</p>}

          <ul className="list">
            {ejerciciosFiltrados.map(e => (
              <li key={e.id} className="item">
                <div className="item-head">
                  <strong>{e.nombre}</strong>
                  <button type="button" className="icon" title="Eliminar" onClick={()=>eliminarEjercicio(e.id)}>✕</button>
                </div>
                <small className="muted">{e.grupo || '—'}</small>
                <div className="series">
                  {e.series.map((s,i)=>(
                    <div key={i} className="series-row">
                      <span>Serie #{i+1}</span>
                      <input className="input tiny" type="number" placeholder="Peso" value={s.peso} onChange={ev=>setSerieValor(e.id,i,'peso',ev.target.value)} />
                      <input className="input tiny" type="number" placeholder="Reps" value={s.reps} onChange={ev=>setSerieValor(e.id,i,'reps',ev.target.value)} />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="row gap">
            <button type="button" className="btn btn-primary" disabled={ejercicios.length===0||enviando} onClick={terminar}>{enviando?'Guardando…':'Terminar entrenamiento'}</button>
            <button type="button" className="btn btn-outline" disabled={enviando} onClick={cancelar}>Cancelar</button>
          </div>
        </>
      ) : (
        <>
          {asignados.length === 0 ? (
            <div className="placeholder">(No hay ejercicios asignados todavía.)</div>
          ) : (
            <ul className="list">
              {asignados.map(e=>(
                <li key={e.id} className="item"><strong>{e.nombre}</strong> <small className="muted">{e.grupo}</small></li>
              ))}
            </ul>
          )}
          <div className="row gap">
            <button type="button" className="btn btn-primary" disabled={enviando} onClick={terminar}>{enviando?'Guardando…':'Terminar entrenamiento'}</button>
            <button type="button" className="btn btn-outline" disabled={enviando} onClick={cancelar}>Cancelar</button>
          </div>
        </>
      )}
    </section>
  );
}

function Historial({ onVolver }) {
  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Historial de entrenamientos</h3>
      <div className="placeholder">(Listado de entrenamientos con fecha y acceso al detalle)</div>
    </section>
  );
}

function TuEntrenador({ onVolver }) {
  const [tiene, setTiene] = useState(false);
  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tu entrenador</h3>
      {!tiene ? (
        <>
          <p className="muted">No tenés entrenador asignado.</p>
          <button type="button" className="btn btn-primary" onClick={()=>alert('Listado de entrenadores (simulado)')}>Agregar entrenador</button>
        </>
      ) : (
        <>
          <div className="card-box">
            <strong>Entrenador/a: </strong>Nombre Apellido<br/>
            <small>Rating: 4.6/5</small>
          </div>
          <div className="row gap">
            <button type="button" className="btn btn-primary" onClick={()=>alert('Feedback (simulado)')}>Dar feedback</button>
            <button type="button" className="btn" onClick={()=>alert('Cambiar (simulado)')}>Cambiar</button>
            <button type="button" className="btn btn-outline" onClick={()=>setTiene(false)}>Dar de baja</button>
          </div>
        </>
      )}
    </section>
  );
}

function Perfil({ onVolver }) {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) ?? {};
    } catch {
      return {};
    }
  }, []);

  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const guardado = JSON.parse(localStorage.getItem("historialPesos") || "[]");
    setHistorial(guardado);
  }, []);

  const actualizarPeso = async () => {
    const nuevoPeso = prompt("Ingresa tu nuevo peso (kg):", usuario?.peso ?? "");
    if (!nuevoPeso) return;

    try {
      const res = await fetch(`http://localhost:3000/api/deportistas/${usuario.dni}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peso: nuevoPeso }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Peso actualizado correctamente");

        const actualizado = { ...usuario, peso: nuevoPeso };
        localStorage.setItem("usuario", JSON.stringify(actualizado));

        const nuevoHistorial = [...historial, parseFloat(nuevoPeso)];
        localStorage.setItem("historialPesos", JSON.stringify(nuevoHistorial));
        setHistorial(nuevoHistorial);
      } else {
        alert(data.mensaje || "Error al actualizar el peso");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
    }
  };

  const darBajaCuenta = async () => {
    if (!usuario?.dni) {
      alert("No se encontró información del usuario");
      return;
    }

    const contrasena = prompt("Ingresa tu contraseña para confirmar la baja de tu cuenta:");
    if (!contrasena) return;

    try {
      const deleteRes = await fetch("http://localhost:3000/api/deportistas/eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: usuario.dni, contrasena }),
      });

      if (deleteRes.ok) {
        alert("Cuenta eliminada correctamente");
        localStorage.removeItem("usuario");
        localStorage.removeItem("historialPesos");
        window.location.reload();
      } else {
        const err = await deleteRes.json();
        alert(err.mensaje || "Error eliminando la cuenta");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión con el servidor");
    }
  };

  const datosGrafico = historial.map((peso, i) => ({ id: i + 1, peso }));

  return (
    <section className="panel perfil-panel">
      <Back onClick={onVolver} />
      <h3 className="perfil-titulo">Tu Perfil</h3>

      <div className="perfil-card">
        <p><strong>Nombre:</strong> {usuario?.nombre ?? "-"}</p>
        <p><strong>Email:</strong> {usuario?.email ?? "-"}</p>

        <div className="perfil-peso">
          <p><strong>Peso actual:</strong> {usuario?.peso ?? "-"}</p>
          <button type="button" className="btn btn-sm btn-primary" onClick={actualizarPeso}>
            Actualizar
          </button>
        </div>
      </div>

      {historial.length > 1 ? (
        <div className="grafico-box">
          <h4 className="grafico-titulo">Progreso de tu peso</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={datosGrafico}>
              <XAxis dataKey="id" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#e63946"
                strokeWidth={3}
                dot={{ fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="grafico-placeholder">
          Aún no hay suficientes registros para mostrar el progreso.
        </p>
      )}

      <button type="button" className="btn btn-outline" onClick={darBajaCuenta}>
        Dar de baja la cuenta
      </button>
    </section>
  );
}

/* ---------- UI ---------- */
function Card({ title, desc, onClick }) {
  return (
    <button
      type="button"
      className="menu-card"
      onClick={(e) => { e.stopPropagation(); console.log('Card click:', title); onClick && onClick(); }}
    >
      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>
    </button>
  );
}
function Back({ onClick }) { return <button type="button" className="btn link" onClick={onClick}>← Volver</button>; }

export default MenuDeportista;

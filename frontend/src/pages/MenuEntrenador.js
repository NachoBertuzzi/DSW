import React, { useState, useMemo, useEffect } from 'react';
import { FallbackCoach, API_URL } from '../services/api';
import SuccessCreated from './SuccessCreated';
import './styles/MenuEntrenador.css';

function MenuEntrenador({ onLogout }) {
  const [vista, setVista] = useState('home'); 
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
          <div className="dropdown-header">
            <button className="hamburger-header">☰</button>
            <div className="dropdown-content-header">
              <button onClick={() => setVista('perfil')}>Tu Perfil</button>
              <button onClick={onLogout}>Cerrar sesión</button>
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
      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} />}
    </div>
  );
}

export function AsignarEntrenamiento({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [lista, setLista] = useState([]);
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState(''); 
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState('');   
  const [ejercicios, setEjercicios] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);

  const GRUPOS_EJERCICIOS = {
    Pecho: ["Press de banca","Press inclinado","Aperturas con mancuernas","Fondos","Pullover","Pec deck","Press declinado","Flexiones","Press máquina","Cruce de cables"],
    Espalda: ["Dominadas","Remo barra","Remo mancuerna","Peso muerto","Jalón al pecho","Pull-over polea","Remo máquina","Hiperextensiones","Encogimientos","Remo al mentón"],
    Hombros: ["Press militar","Elevaciones laterales","Elevaciones frontales","Elevaciones posteriores","Press Arnold","Face pull","Remo al mentón","Encogimiento hombros","Elevación máquina","Pájaros"],
    Bíceps: ["Curl barra","Curl mancuernas","Curl martillo","Curl concentrado","Curl predicador","Curl polea","Curl inverso","Curl alternado","Curl 21s","Zottman"],
    Tríceps: ["Fondos","Press francés","Extensión polea","Patada tríceps","Press cerrado","Skull crusher","Extensión mancuerna","Dips banco","Extensión máquina","Press polea"],
    Piernas: ["Sentadilla barra","Sentadilla frontal","Prensa","Zancadas","Peso muerto rumano","Extensión piernas","Curl piernas","Elevación talones","Hip thrust","Step-ups"],
    Abdominales: ["Crunch","Elevación piernas","Plancha","Plancha lateral","Crunch polea","Ab wheel","Elevación rodillas","Crunch oblicuo","Mountain climbers","Russian twists"]
  };

  const cargar = () => setLista(FallbackCoach.getLista(coach.dni) || []);
  useEffect(cargar, [coach.dni]);

  const refrescarLista = () => cargar();

  const visibles = (lista || [])
    .filter(d => {
      if (!q) return true;
      const hay = `${d?.nombre || ''} ${d?.apellido || ''} ${d?.username || d?.usuario || ''}`
        .toLowerCase()
        .includes(q.toLowerCase());
      return hay;
    })
    .sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));

  const ejerciciosDelGrupo = grupo ? GRUPOS_EJERCICIOS[grupo] : [];

  const agregarEj = () => {
    if (!grupo) return alert('Seleccioná un grupo muscular');
    if (!nombre) return alert('Seleccioná un ejercicio');
    setEjercicios(p => [...p, { id: crypto.randomUUID(), nombre, grupo }]);
    setNombre('');
  };

  const eliminarEj = (id) => setEjercicios(p => p.filter(e => e.id !== id));

const terminar = async () => {
  if (!selId) return alert('Elegí un deportista');
  if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');
  if (!coach?.dni) return alert('No se encontró tu DNI de entrenador en la sesión');

  const seleccionado = lista.find(d => String(d.id) === String(selId));
  const deportistaDni = seleccionado?.dni || seleccionado?.id || null;

  if (!deportistaDni) return alert('No encuentro el DNI/ID del deportista seleccionado.');

  const base = API_URL || 'http://localhost:3000/api';

  try {
    setEnviando(true);

    const r1 = await fetch(`${base}/entrenamientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fechaEntrenamiento: fecha,
        ...(hora ? { horaEntrenamiento: hora } : {}),
        deportista: { dni: String(deportistaDni) },
      }),
    });
    if (!r1.ok) {
      const txt = await r1.text().catch(() => '');
      throw new Error(`No se pudo crear el entrenamiento. ${txt}`);
    }
    const data1 = await r1.json().catch(() => ({}));
    const entrenamientoId = data1?.data?.id ?? data1?.id; 
    if (!entrenamientoId) {
      throw new Error('El backend no devolvió id del entrenamiento.');
    }

    const r2 = await fetch(`${base}/asignaciones-entrenamientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entrenadorDni: String(coach.dni),
        deportistaDni: String(deportistaDni),
        entrenamientoId: Number(entrenamientoId),
        fecha, 
        notas: ejercicios.map(e => `${e.grupo}: ${e.nombre}`).join(' | ') || undefined, 
      }),
    });
    if (!r2.ok) {
      const txt = await r2.text().catch(() => '');
      throw new Error(`No se pudo crear la asignación. ${txt}`);
    }

    alert('Entrenamiento asignado con éxito');
    onVolver();
  } catch (e) {
    console.error(e);
    alert(e.message || 'No se pudo guardar en el backend');
  } finally {
    setEnviando(false);
  }
};


  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Asignar entrenamiento</h3>

      <div className="row gap wrap">
        <input
          className="input"
          placeholder="Buscar deportista (nombre o @username)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <button className="btn btn-outline" onClick={refrescarLista}>Actualizar lista</button>
      </div>

      <div className="row gap wrap">
        <select className="input" value={selId} onChange={e => setSelId(e.target.value)}>
          <option value="">— Elegí un deportista —</option>
          {visibles.map(d => (
            <option key={d.id} value={d.id}>
              {d.nombre || d.username || d.id}
            </option>
          ))}
        </select>
      </div>

      <div className="row gap wrap">
        <div>
          <label className="muted" style={{ display: 'block', marginBottom: 4 }}>Fecha</label>
          <input className="input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div>
          <label className="muted" style={{ display: 'block', marginBottom: 4 }}>Hora (opcional)</label>
          <input className="input" type="time" value={hora} onChange={e => setHora(e.target.value)} placeholder="hh:mm" />
        </div>
      </div>

      <div className="row gap wrap">
        <select className="input" value={grupo} onChange={e => { setGrupo(e.target.value); setNombre(''); }}>
          <option value="">— Seleccioná grupo muscular —</option>
          {Object.keys(GRUPOS_EJERCICIOS).map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select className="input" value={nombre} onChange={e => setNombre(e.target.value)} disabled={!grupo}>
          <option value="">— Seleccioná ejercicio —</option>
          {(ejerciciosDelGrupo).map(ej => <option key={ej} value={ej}>{ej}</option>)}
        </select>

        <button className="btn btn-primary" onClick={agregarEj} disabled={!nombre}>Agregar</button>
      </div>

      <ul className="list">
        {ejercicios.map(e => (
          <li key={e.id} className="item">
            <div className="item-head">
              <div><strong>{e.nombre}</strong> <small className="muted">{e.grupo}</small></div>
              <button className="icon" onClick={() => eliminarEj(e.id)}>✕</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="row gap">
        <button
          className="btn btn-primary"
          disabled={!selId || ejercicios.length === 0 || enviando}
          onClick={terminar}
        >
          {enviando ? 'Guardando…' : 'Terminar'}
        </button>
        <button className="btn btn-outline" disabled={enviando} onClick={onVolver}>Cancelar</button>
      </div>
    </section>
  );
}


function HistorialEntrenador({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/asignaciones-entrenamientos/entrenadores/${coach.dni}`);
        const json = await res.json().catch(() => ({}));
        const arr = Array.isArray(json?.data) ? json.data : [];
        setItems(arr);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [coach.dni]);

  const filtrados = (items || [])
    .filter(it => q ? ((it?.deportista?.nombre || '').toLowerCase().includes(q.toLowerCase())) : true);

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Historial de entrenamientos asignados</h3>

      <input
        className="input"
        placeholder="Filtrar por deportista…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <p className="muted">No asignaste entrenamientos todavía.</p>
      ) : (
        <ul className="list">
          {filtrados.map(it => (
            <li key={it.id} className="item">
              <div>
                <strong>
                  {it?.entrenamiento?.fechaEntrenamiento || it?.fecha || '—'}
                  {' '}
                  {it?.entrenamiento?.horaEntrenamiento || ''}
                </strong><br />
                <small className="muted">
                  Deportista: {it?.deportista?.nombre || it?.deportista?.dni || '—'}
                </small>
                {it?.notas ? (
                  <div><small className="muted">Notas: {it.notas}</small></div>
                ) : null}
                <div><small className="muted">Estado: {it?.estado}</small></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


function TusDeportistas({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [lista, setLista] = useState([]);
  const [q, setQ] = useState('');

  const cargar = () => setLista(FallbackCoach.getLista(coach.dni) || []);
  useEffect(cargar, [coach.dni]);

  const fmt = (iso) => {
    try { const d = new Date(iso); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0,5); }
    catch { return ''; }
  };

  const baja = (id) => {
    if (!window.confirm('¿Dar de baja a este deportista?')) return;

    const dep = (lista || []).find(d => String(d.id) === String(id) || String(d.dni) === String(id));
    FallbackCoach.desvincularDeportista(coach.dni, dep?.dni || id);
    cargar();
  };

  const visibles = (lista || [])
    .filter(d => {
      if (!q) return true;
      const hay = `${d?.nombre || ''} ${d?.apellido || ''} ${d?.username || d?.usuario || ''}`
        .toLowerCase()
        .includes(q.toLowerCase());
      return hay;
    })
    .sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tus deportistas</h3>

      <div className="row gap wrap" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Buscar (nombre o @username)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>

      {visibles.length === 0 ? (
        <p className="muted">No hay deportistas para mostrar.</p>
      ) : (
        <ul className="list">
          {visibles.map(d => {
            const ultima = FallbackCoach.getUltimaNota(coach.dni, d.dni || d.id);
            return (
              <li key={d.id} className="item">
                <div>
                  <strong>{d.nombre || d.username}</strong>
                  {d.username && <div><small className="muted">@{d.username}</small></div>}
                  {ultima && (
                    <div style={{marginTop: 4}}>
                      <small className="muted">Última nota ({fmt(ultima.fecha)}):</small>
                      <div>{ultima.texto}</div>
                    </div>
                  )}
                </div>
                <button className="btn btn-outline" onClick={() => baja(d.id)}>Dar de baja</button>
              </li>
            );
          })}
        </ul>
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

  const eliminarCuenta = async () => {
    const confirmacion = window.confirm("¿Seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (!confirmacion) return;

    const contrasena = prompt("Por seguridad, ingresá tu contraseña:");
    if (!contrasena) return;

    try {
      const res = await fetch(`${API_URL}/entrenadores/${usuario.dni}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena }),
      });
      const data = await res.json().catch(()=>({}));
      if (res.ok) {
        alert("Cuenta eliminada correctamente.");
        localStorage.removeItem("usuario");
        window.location.reload();
      } else {
        alert(data.mensaje || "Error al eliminar la cuenta");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
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

      <button className="btn btn-outline" onClick={eliminarCuenta}>Dar de baja cuenta</button>
    </section>
  );
}

function Card({ title, desc, onClick }) {
  return (
    <button className="menu-card" onClick={onClick}>
      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>
    </button>
  );
}
function Back({ onClick }) { return <button className="btn link" onClick={onClick}>← Volver</button>; }

export default MenuEntrenador;

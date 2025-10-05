import React, { useState, useMemo, useEffect } from 'react';
import { Entrenamientos, FallbackCoach, API_URL } from '../services/api';
import SuccessCreated from './SuccessCreated';
import './styles/MenuEntrenador.css';

function MenuEntrenador({ onLogout }) {
  const [vista, setVista] = useState('home'); // home | asignar | historial | deportistas | perfil
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
    <Card title="3) Tus deportistas" desc="Listar, agregar y dar de baja" onClick={() => setVista('deportistas')} />
    {/* La opción 'Tu Perfil' se eliminó del menú principal */}
  </div>
)}

      {vista === 'asignar' && <AsignarEntrenamiento onVolver={() => setVista('home')} />}
      {vista === 'historial' && <HistorialEntrenador onVolver={() => setVista('home')} />}
      {vista === 'deportistas' && <TusDeportistas onVolver={() => setVista('home')} />}
      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} />}
    </div>
  );
}

/* ---------- Asignar ---------- */
function AsignarEntrenamiento({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [lista, setLista] = useState([]);
  const [selId, setSelId] = useState('');
  const [usernameNuevo, setUsernameNuevo] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0,10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0,5));
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const arr = FallbackCoach.getLista(coach.dni);
    setLista(arr);
    if (!selId && arr.length) setSelId(String(arr[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coach.dni]);

  const agregarDeportista = () => {
    const u = usernameNuevo.trim();
    if (!u) return;
    if (lista.some(d => (d.username || d.nombre) === u)) return alert('Ese username ya está en tu lista.');
    const nuevo = FallbackCoach.addPorUsername(coach.dni, u);
    setUsernameNuevo(''); setLista(p => [nuevo, ...p]); setSelId(String(nuevo.id));
  };

  const agregarEj = () => {
    if (!nombre.trim()) return alert('Poné un nombre de ejercicio');
    setEjercicios(p => [...p, { id: crypto.randomUUID(), nombre: nombre.trim(), grupo: grupo.trim() }]);
    setNombre(''); setGrupo('');
  };
  const eliminarEj = (id) => setEjercicios(p => p.filter(e=>e.id!==id));

  const terminar = async () => {
    if (!selId) return alert('Elegí un deportista');
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');
    if (!coach?.dni) return alert('No se encontró tu DNI de entrenador en la sesión');

    const seleccionado = lista.find(d => String(d.id) === String(selId));
    const deportistaDni = seleccionado?.dni || null;

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      entrenador: coach.dni,
      ...(deportistaDni ? { deportista: deportistaDni } : {}),
    };

    try {
      setEnviando(true);
      await Entrenamientos.crear(payload);
      alert('Entrenamiento asignado');
      onVolver();
    } catch (e1) {
      try {
        const res = await fetch(`${API_URL}/entrenamientos`, {
          method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP '+res.status);
        alert('Entrenamiento asignado'); onVolver();
      } catch(e2) {
        console.error(e2); alert('No se pudo guardar en el backend');
      }
    } finally { setEnviando(false); }
  };

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Asignar entrenamiento</h3>

      <div className="row gap wrap">
        <select className="input" value={selId} onChange={e=>setSelId(e.target.value)}>
          <option value="">— Elegí un deportista —</option>
          {lista.map(d => <option key={d.id} value={d.id}>{d.nombre || d.username || d.id}</option>)}
        </select>
        <input className="input" placeholder="Agregar deportista por username…" value={usernameNuevo} onChange={e=>setUsernameNuevo(e.target.value)} />
        <button className="btn" onClick={agregarDeportista}>Agregar</button>
      </div>

      <div className="row gap wrap">
        <input className="input" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
        <input className="input" type="time" value={hora} onChange={e=>setHora(e.target.value)} />
      </div>

      <div className="row gap wrap">
        <input className="input" placeholder="Nombre ejercicio" value={nombre} onChange={e=>setNombre(e.target.value)} />
        <input className="input" placeholder="Grupo muscular" value={grupo} onChange={e=>setGrupo(e.target.value)} />
        <button className="btn btn-primary" onClick={agregarEj}>Agregar</button>
      </div>

      <ul className="list">
        {ejercicios.map(e=>(
          <li key={e.id} className="item">
            <div className="item-head">
              <div><strong>{e.nombre}</strong> <small className="muted">{e.grupo}</small></div>
              <button className="icon" onClick={()=>eliminarEj(e.id)}>✕</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="row gap">
        <button className="btn btn-primary" disabled={!selId || ejercicios.length===0 || enviando} onClick={terminar}>
          {enviando ? 'Guardando…' : 'Terminar'}
        </button>
        <button className="btn btn-outline" disabled={enviando} onClick={onVolver}>Cancelar</button>
      </div>
    </section>
  );
}

/* ---------- Historial ---------- */
function HistorialEntrenador({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try{
        const res = await fetch(`${API_URL}/entrenamientos`);
        const json = await res.json().catch(()=>({}));
        const todos = json?.data || [];
        setItems(todos.filter(e => e?.entrenador?.dni === coach.dni));
      }catch(e){ console.error(e); setItems([]); }
      finally{ setLoading(false); }
    })();
  }, [coach.dni]);

  const filtrados = items
    .filter(it => q ? ((it?.deportista?.nombre||'').toLowerCase().includes(q.toLowerCase())) : true)
    .sort((a,b)=> new Date(`${b.fechaEntrenamiento}T${b.horaEntrenamiento||'00:00'}`) - new Date(`${a.fechaEntrenamiento}T${a.horaEntrenamiento||'00:00'}`));

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Historial de entrenamientos asignados</h3>
      <input className="input" placeholder="Filtrar por deportista…" value={q} onChange={e=>setQ(e.target.value)} />
      {loading ? <p className="muted">Cargando…</p> :
        filtrados.length === 0 ? <p className="muted">No asignaste entrenamientos todavía.</p> :
        <ul className="list">
          {filtrados.map(it=>(
            <li key={it.id} className="item">
              <div><strong>{it.fechaEntrenamiento} {it.horaEntrenamiento || ''}</strong><br/>
              <small className="muted">Deportista: {it?.deportista?.nombre || '—'}</small></div>
            </li>
          ))}
        </ul>
      }
    </section>
  );
}

/* ---------- TusDeportistas ---------- */
function TusDeportistas({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [lista, setLista] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(()=>{ setLista(FallbackCoach.getLista(coach.dni)); }, [coach.dni]);

  const agregar = () => {
    const u = username.trim();
    if (!u) return;
    if (lista.some(d => (d.username || d.nombre) === u)) return alert('Ese username ya está en tu lista.');
    FallbackCoach.addPorUsername(coach.dni, u);
    setUsername(''); setLista(FallbackCoach.getLista(coach.dni));
  };

  const baja = (id) => {
    if (!window.confirm('¿Dar de baja a este deportista?')) return;
    FallbackCoach.quitar(coach.dni, id);
    setLista(FallbackCoach.getLista(coach.dni));
  };

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tus deportistas</h3>

      <div className="row gap wrap">
        <input className="input" placeholder="Agregar por username…" value={username} onChange={e=>setUsername(e.target.value)} />
        <button className="btn btn-primary" onClick={agregar}>Agregar</button>
      </div>

      {lista.length === 0 ? <p className="muted">No tenés deportistas asignados.</p> : (
        <ul className="list">
          {lista.map(d=>(
            <li key={d.id} className="item">
              <div><strong>{d.nombre || d.username}</strong>{d.username && <div><small className="muted">@{d.username}</small></div>}</div>
              <button className="btn btn-outline" onClick={()=>baja(d.id)}>Dar de baja</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- Perfil ---------- */
function Perfil({ onVolver }) {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) ?? {};
    } catch {
      return {};
    }
  }, []);

  const eliminarCuenta = async () => {
    const confirmacion = window.confirm(
      "¿Seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    if (!confirmacion) return;

    const contrasena = prompt("Por seguridad, ingresá tu contraseña:");
    if (!contrasena) return;

    try {
      const res = await fetch(`http://localhost:3000/api/entrenadores/${usuario.dni}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena }),
      });

      const data = await res.json();

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

      <button className="btn btn-outline" onClick={eliminarCuenta}>
        Dar de baja cuenta
      </button>
    </section>
  );
}


/* ---------- UI ---------- */
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
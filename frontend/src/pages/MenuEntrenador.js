import React, { useState, useMemo, useEffect } from 'react';
import { Entrenamientos, FallbackCoach, API_URL } from '../services/api';
import SuccessCreated from './SuccessCreated';

function MenuEntrenador({ onLogout }) {
  const [vista, setVista] = useState('home'); // home | asignar | historial | deportistas | perfil
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
  }, []);

  return (
    <div style={styles.wrap}>
      <SuccessCreated />
      <header style={styles.header}>
        <h2 style={{ margin: 0 }}>Menú del Entrenador</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <small>{usuario?.nombre ? `Hola, ${usuario.nombre}` : ''}</small>
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      {vista === 'home' && (
        <div style={styles.grid}>
          <Card title="1) Asignar entrenamiento" onClick={() => setVista('asignar')}
                desc="Crear y asignar entrenamientos" />
          <Card title="2) Historial de entrenamientos" onClick={() => setVista('historial')}
                desc="Ver entrenamientos que asignaste" />
          <Card title="3) Tus deportistas" onClick={() => setVista('deportistas')}
                desc="Listar, agregar y dar de baja" />
          <Card title="4) Tu perfil" onClick={() => setVista('perfil')}
                desc="Datos de tu cuenta" />
        </div>
      )}

      {vista === 'asignar' && <AsignarEntrenamiento onVolver={() => setVista('home')} />}
      {vista === 'historial' && <HistorialEntrenador onVolver={() => setVista('home')} />}
      {vista === 'deportistas' && <TusDeportistas onVolver={() => setVista('home')} />}
      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} />}
    </div>
  );
}

/* =========================
   SUBVISTA: AsignarEntrenamiento
========================= */
function AsignarEntrenamiento({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}'); // debe tener dni
  const [lista, setLista] = useState([]);
  const [selId, setSelId] = useState('');
  const [usernameNuevo, setUsernameNuevo] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));   // HH:mm

  // builder simple (informativo por ahora)
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Cargar "mis deportistas" al montar o si cambia el DNI del coach
  useEffect(() => {
    const arr = FallbackCoach.getLista(coach.dni);
    setLista(arr);
    if (!selId && arr.length) setSelId(String(arr[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coach.dni]);

  const agregarDeportista = () => {
    const u = usernameNuevo.trim();
    if (!u) return;
    if (lista.some(d => (d.username || d.nombre) === u)) {
      alert('Ese username ya está en tu lista.');
      return;
    }
    const nuevo = FallbackCoach.addPorUsername(coach.dni, u);
    setUsernameNuevo('');
    setLista((p) => [nuevo, ...p]);
    setSelId(String(nuevo.id));
  };

  const agregarEj = () => {
    if (!nombre.trim()) return alert('Poné un nombre de ejercicio');
    setEjercicios((p) => [
      ...p,
      { id: crypto.randomUUID(), nombre: nombre.trim(), grupo: grupo.trim() },
    ]);
    setNombre(''); setGrupo('');
  };
  const eliminarEj = (id) => setEjercicios((p) => p.filter((e) => e.id !== id));

  const terminar = async () => {
    if (!selId) return alert('Elegí un deportista');
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');
    if (!coach?.dni) return alert('No se encontró tu DNI de entrenador en la sesión');

    const seleccionado = lista.find(d => String(d.id) === String(selId));
    const deportistaDni = seleccionado?.dni || null; // en fallback no lo tenemos

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      entrenador: coach.dni,               // referencia por DNI
      ...(deportistaDni ? { deportista: deportistaDni } : {}),
      // ejercicios: []  // cuando extiendas el backend
    };

    try {
      setEnviando(true);
      // 1) Intento con el service
      await Entrenamientos.crear(payload);
      alert('Entrenamiento asignado');
      onVolver();
    } catch (e1) {
      console.warn('Fallo Entrenamientos.crear, intento fetch directo:', e1);
      try {
        // 2) Fallback directo a fetch usando la misma base del service
        const res = await fetch(`${API_URL}/entrenamientos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        alert('Entrenamiento asignado');
        onVolver();
      } catch (e2) {
        console.error(e2);
        alert('No se pudo guardar en el backend');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section>
      <Back onClick={onVolver} />
      <h3>Asignar entrenamiento</h3>

      {/* Elegir / agregar deportista */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
        <select value={selId} onChange={(e) => setSelId(e.target.value)} style={styles.input}>
          <option value="">— Elegí un deportista —</option>
          {lista.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre || d.username || d.id}
            </option>
          ))}
        </select>

        <input
          placeholder="Agregar deportista por username…"
          value={usernameNuevo}
          onChange={(e) => setUsernameNuevo(e.target.value)}
          style={styles.input}
        />
        <button onClick={agregarDeportista}>Agregar</button>
      </div>

      {/* Fecha / hora */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
      </div>

      {/* Builder ejercicios */}
      <div style={styles.formRow}>
        <input
          placeholder="Nombre ejercicio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Grupo muscular"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
          style={styles.input}
        />
        <button onClick={agregarEj}>Agregar</button>
      </div>

      <ul style={styles.list}>
        {ejercicios.map((e) => (
          <li key={e.id} style={styles.listItem}>
            <div>
              <strong>{e.nombre}</strong>{' '}
              <small style={{ opacity: 0.7 }}>{e.grupo}</small>
            </div>
            <button onClick={() => eliminarEj(e.id)}>✕</button>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={terminar} disabled={!selId || ejercicios.length === 0 || enviando}>
          {enviando ? 'Guardando…' : 'Terminar'}
        </button>
        <button onClick={onVolver} disabled={enviando}>Cancelar</button>
      </div>
    </section>
  );
}

/* =========================
   SUBVISTA: HistorialEntrenador
========================= */
function HistorialEntrenador({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/entrenamientos`);
        if (!res.ok) throw new Error('HTTP ' + res.status);

        const json = await res.json();
        const todos = json?.data || [];
        const mios = todos.filter(e => e?.entrenador?.dni === coach.dni);

        setItems(mios);
      } catch (e) {
        console.error('HistorialEntrenador:', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [coach.dni]);

  const filtrados = items
    .filter(it => (q ? ((it?.deportista?.nombre || '').toLowerCase().includes(q.toLowerCase())) : true))
    .sort((a,b) => {
      const da = new Date(`${a.fechaEntrenamiento}T${a.horaEntrenamiento || '00:00'}`);
      const db = new Date(`${b.fechaEntrenamiento}T${b.horaEntrenamiento || '00:00'}`);
      return db - da;
    });

  return (
    <section>
      <Back onClick={onVolver}/>
      <h3>Historial de entrenamientos asignados</h3>

      <input
        placeholder="Filtrar por deportista…"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        style={styles.input}
      />

      {loading ? <p>Cargando…</p> :
        (filtrados.length === 0 ? (
          <p>No asignaste entrenamientos todavía.</p>
        ) : (
          <ul style={styles.list}>
            {filtrados.map(it => (
              <li key={it.id} style={styles.listItem}>
                <div>
                  <strong>{it.fechaEntrenamiento} {it.horaEntrenamiento || ''}</strong><br/>
                  <small>Deportista: {it?.deportista?.nombre || '—'}</small>
                </div>
              </li>
            ))}
          </ul>
        ))
      }
    </section>
  );
}

/* =========================
   SUBVISTA: TusDeportistas
========================= */
function TusDeportistas({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [lista, setLista] = useState([]);
  const [username, setUsername] = useState('');

  // Cargar lista al montar o si cambia el DNI del coach
  useEffect(() => {
    setLista(FallbackCoach.getLista(coach.dni));
  }, [coach.dni]);

  const agregar = () => {
    const u = username.trim();
    if (!u) return;
    if (lista.some(d => (d.username || d.nombre) === u)) {
      alert('Ese username ya está en tu lista.');
      return;
    }
    FallbackCoach.addPorUsername(coach.dni, u);
    setUsername('');
    setLista(FallbackCoach.getLista(coach.dni));
  };

  const baja = (id) => {
    if (!window.confirm('¿Dar de baja a este deportista?')) return;
    FallbackCoach.quitar(coach.dni, id);
    setLista(FallbackCoach.getLista(coach.dni));
  };

  return (
    <section>
      <Back onClick={onVolver}/>
      <h3>Tus deportistas</h3>

      <div style={{display:'flex', gap:8, margin:'8px 0', flexWrap:'wrap'}}>
        <input
          placeholder="Agregar por username…"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          style={styles.input}
        />
        <button onClick={agregar}>Agregar</button>
      </div>

      {lista.length === 0 ? (
        <p>No tenés deportistas asignados.</p>
      ) : (
        <ul style={styles.list}>
          {lista.map(d => (
            <li key={d.id} style={styles.listItem}>
              <div>
                <strong>{d.nombre || d.username}</strong>
                {d.username && <div><small>@{d.username}</small></div>}
              </div>
              <button onClick={()=>baja(d.id)}>Dar de baja</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* =========================
   SUBVISTA: Perfil
========================= */
function Perfil({ onVolver }) {
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
  }, []);
  return (
    <section>
      <Back onClick={onVolver}/>
      <h3>Tu perfil</h3>
      <p><strong>Nombre:</strong> {usuario?.nombre || '-'}</p>
      <p><strong>Email:</strong> {usuario?.email || '-'}</p>
      <button onClick={()=>alert('Dar de baja cuenta (simulado)')}>Dar de baja cuenta</button>
    </section>
  );
}

/* =========================
   UI helpers
========================= */
function Card({ title, desc, onClick }) {
  return (
    <button onClick={onClick} style={styles.card}>
      <div style={{textAlign:'left'}}>
        <div style={{fontWeight:700}}>{title}</div>
        <div style={{opacity:0.8, marginTop:4}}>{desc}</div>
      </div>
    </button>
  );
}

function Back({ onClick }) {
  return <button onClick={onClick} style={{marginBottom:10}}>← Volver</button>;
}

/* =========================
   estilos
========================= */
const styles = {
  wrap: { maxWidth: 900, margin: '0 auto', padding: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 },
  card: { width:'100%', padding:16, border:'1px solid #ddd', borderRadius:12, cursor:'pointer', background:'white', textAlign:'left' },
  formRow: { display:'flex', flexWrap:'wrap', gap:8, margin:'8px 0' },
  input: { padding:8, borderRadius:6, border:'1px solid #ddd' },
  list: { listStyle:'none', padding:0, marginTop:8 },
  listItem: { border:'1px solid #eee', borderRadius:8, padding:12, marginBottom:8, background:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }
};

export default MenuEntrenador;

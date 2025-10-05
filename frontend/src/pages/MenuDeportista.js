// MenuDeportista.js
import React, { useState, useMemo, useEffect } from 'react';
import SuccessCreated from './SuccessCreated';
import { Entrenamientos, API_URL } from '../services/api';
import './styles/MenuDeportista.css';

function MenuDeportista({ onLogout }) {
  const [vista, setVista] = useState('home'); // home | agregar | historial | entrenador | perfil
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; }
    catch { return {}; }
  }, []);

  return (
    <div className="menu-screen">
      <SuccessCreated />
      <header className="menu-header">
        <h2>Menú del Deportista</h2>
        <div className="header-actions">
          <small>{usuario?.nombre ? `Hola, ${usuario.nombre}` : ''}</small>
          <button className="btn btn-outline" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      {vista === 'home' && (
        <div className="menu-grid">
          <Card title="1) Agregar entrenamiento" desc="Crear entrenamiento (propio o asignado)" onClick={() => setVista('agregar')} />
          <Card title="2) Historial de entrenamientos" desc="Ver entrenamientos anteriores" onClick={() => setVista('historial')} />
          <Card title="3) Tu entrenador" desc="Ver/Agregar/Cambiar entrenador" onClick={() => setVista('entrenador')} />
          <Card title="4) Tu perfil" desc="Datos de tu cuenta" onClick={() => setVista('perfil')} />
        </div>
      )}

      {vista === 'agregar' && <Agregar onVolver={() => setVista('home')} />}
      {vista === 'historial' && <Historial onVolver={() => setVista('home')} />}
      {vista === 'entrenador' && <TuEntrenador onVolver={() => setVista('home')} />}
      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} />}
    </div>
  );
}


/* ---------- Subvista: AGREGAR (con “cargar último”) ---------- */
function Agregar({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);

  const [modo, setModo] = useState('propio'); // propio | asignado
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));

  // Nombre del entrenador (solo informativo para historial)
  const [coachName, setCoachName] = useState('');

  // builder propio
  const [query, setQuery] = useState('');
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [cantSeries, setCantSeries] = useState(1);

  const [enviando, setEnviando] = useState(false);
  const [cargadoUltimo, setCargadoUltimo] = useState(false);

  // asignado (placeholder local)
  const [asignados, setAsignados] = useState([]);
  useEffect(() => {
    if (modo === 'asignado') {
      const key = `assigned:${usuario?.dni}`;
      setAsignados(JSON.parse(localStorage.getItem(key) || '[]'));
    }
  }, [modo, usuario?.dni]);

  // >>> NUEVO: precargar el último entrenamiento del historial al entrar
  useEffect(() => {
    try {
      if (!usuario?.dni) return;
      if (ejercicios.length > 0) return; // si ya hay algo cargado, no pisar
      const keyHist = `athlete:${usuario.dni}:historial`;
      const arr = JSON.parse(localStorage.getItem(keyHist) || '[]');
      const ultimo = arr?.[0];
      if (ultimo?.ejercicios?.length) {
        // normalizo: aseguro id y bandera eliminado
        const clon = ultimo.ejercicios.map(e => ({
          id: e.id || crypto.randomUUID(),
          nombre: e.nombre || '',
          grupo: e.grupo || '',
          eliminado: !!e.eliminado, // si estaba eliminado, lo respetamos
          series: Array.isArray(e.series) ? e.series.map(s => ({ peso: s.peso || '', reps: s.reps || '' })) : [],
        }));
        setEjercicios(clon);
        setCoachName(ultimo.entrenadorNombre || '');
        setCargadoUltimo(true);
      }
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.dni]);

  const limpiarLista = () => {
    setEjercicios([]);
    setCargadoUltimo(false);
  };

  // ---- ejercicios (propio) ----
  const agregarEjercicio = () => {
    const n = nombre.trim();
    const g = grupo.trim();
    const series = Math.max(1, Number(cantSeries) || 1);
    if (!n) return alert('Poné un nombre de ejercicio');

    const nuevo = {
      id: crypto.randomUUID(),
      nombre: n,
      grupo: g,
      eliminado: false,
      series: Array.from({ length: series }, () => ({ peso: '', reps: '' })),
    };
    setEjercicios(prev => [nuevo, ...prev]);
    setNombre(''); setGrupo(''); setCantSeries(1);
  };

  const setSerieValor = (idEj, idx, campo, valor) => {
    setEjercicios(prev =>
      prev.map(e =>
        e.id !== idEj
          ? e
          : { ...e, series: e.series.map((s, i) => (i === idx ? { ...s, [campo]: valor } : s)) }
      )
    );
  };

  const eliminarEjercicio = (id, siEliminar = true) => {
    setEjercicios(prev => prev.map(e => (e.id === id ? { ...e, eliminado: siEliminar } : e)));
  };

  const ejerciciosActivos = ejercicios.filter(e => !e.eliminado);
  const ejerciciosFiltrados = query
    ? ejerciciosActivos.filter(e => (e.nombre + ' ' + (e.grupo || '')).toLowerCase().includes(query.toLowerCase()))
    : ejerciciosActivos;

  // ---- guardar entrenamiento ----
  const terminar = async () => {
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (!usuario?.dni) return alert('No se encontró tu DNI en la sesión');
    if (modo === 'propio' && ejerciciosActivos.length === 0) return alert('Agregá al menos un ejercicio');

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      deportista: { dni: String(usuario.dni) },
    };

    try {
      setEnviando(true);

      // 1) backend (best-effort)
      let created = null;
      try {
        if (Entrenamientos?.crear) created = await Entrenamientos.crear(payload);
        else {
          const base = (import.meta?.env?.VITE_API_URL) || process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
          const res = await fetch(`${base}/entrenamientos`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          created = await res.json().catch(() => ({}));
        }
      } catch { /* si falla, seguimos guardando local */ }

      const backendId = created?.data?.id ?? created?.id ?? null;

      // 2) guardo detalle completo (incluye eliminados) en historial local
      const keyHist = `athlete:${usuario?.dni}:historial`;
      const prev = JSON.parse(localStorage.getItem(keyHist) || '[]');
      const item = {
        idLocal: crypto.randomUUID(),
        backendId,
        fechaEntrenamiento: fecha,
        horaEntrenamiento: hora,
        entrenadorNombre: coachName.trim() || null,
        ejercicios: ejercicios.map(e => ({ ...e })), // TODOS (eliminados y no)
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(keyHist, JSON.stringify([item, ...prev]));

      // limpio builder y vuelvo
      setEjercicios([]);
      setNombre(''); setGrupo(''); setCantSeries(1); setCoachName('');
      setCargadoUltimo(false);
      alert('Entrenamiento guardado');
      onVolver();
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar en el backend');
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = () => {
    if (window.confirm('¿Cancelar? Se perderán los cambios.')) onVolver();
  };

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Agregar entrenamiento</h3>

      <div className="row gap">
        <button className={`btn ${modo === 'propio' ? 'btn-primary' : ''}`} onClick={() => setModo('propio')}>Opción 1: Propio</button>
        <button className={`btn ${modo === 'asignado' ? 'btn-primary' : ''}`} onClick={() => setModo('asignado')}>Opción 2: Asignado</button>
      </div>

      <div className="row gap">
        <input className="input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        <input className="input" type="time" value={hora} onChange={e => setHora(e.target.value)} />
      </div>

      <div className="row gap">
        <input
          className="input"
          placeholder="Nombre del entrenador (opcional)"
          value={coachName}
          onChange={e => setCoachName(e.target.value)}
        />
      </div>

      {cargadoUltimo && ejercicios.length > 0 && (
        <div className="row gap" style={{ alignItems: 'center' }}>
          <small className="muted">Se cargó el último entrenamiento guardado.</small>
          <button className="btn btn-outline" onClick={limpiarLista}>Vaciar lista</button>
        </div>
      )}

      {modo === 'propio' ? (
        <>
          <div className="row gap">
            <input
              className="input"
              placeholder="Filtrar por nombre o grupo…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="row gap wrap">
            <input className="input" placeholder="Nombre del ejercicio" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input className="input" placeholder="Grupo muscular" value={grupo} onChange={e => setGrupo(e.target.value)} />
            <input className="input small" type="number" min={1} value={cantSeries} onChange={e => setCantSeries(e.target.value)} placeholder="Cant. series" />
            <button className="btn btn-primary" onClick={agregarEjercicio}>Agregar</button>
          </div>

          {ejerciciosFiltrados.length === 0 ? (
            <p className="muted">Lista de ejercicios (vacía o todos eliminados).</p>
          ) : (
            <ul className="list">
              {ejerciciosFiltrados.map(e => (
                <li key={e.id} className="item">
                  <div className="item-head">
                    <strong>{e.nombre}</strong>
                    <button className="btn btn-outline" onClick={() => eliminarEjercicio(e.id, true)}>Eliminar</button>
                  </div>
                  <small className="muted">{e.grupo || '—'}</small>
                  <div className="series">
                    {e.series.map((s, i) => (
                      <div key={i} className="series-row">
                        <span>Serie #{i + 1}</span>
                        <input
                          className="input tiny"
                          type="number"
                          placeholder="Peso"
                          value={s.peso}
                          onChange={ev => setSerieValor(e.id, i, 'peso', ev.target.value)}
                        />
                        <input
                          className="input tiny"
                          type="number"
                          placeholder="Reps"
                          value={s.reps}
                          onChange={ev => setSerieValor(e.id, i, 'reps', ev.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {ejercicios.some(x => x.eliminado) &&
            <small className="muted">Se ocultaron {ejercicios.filter(x => x.eliminado).length} ejercicios eliminados (igual quedarán registrados en el historial).</small>
          }

          <div className="row gap">
            <button className="btn btn-primary" disabled={ejerciciosActivos.length === 0 || enviando} onClick={terminar}>
              {enviando ? 'Guardando…' : 'Terminar entrenamiento'}
            </button>
            <button className="btn btn-outline" disabled={enviando} onClick={cancelar}>Cancelar</button>
          </div>
        </>
      ) : (
        <>
          {asignados.length === 0 ? (
            <div className="placeholder">(No hay ejercicios asignados todavía.)</div>
          ) : (
            <ul className="list">
              {asignados.map(e => (
                <li key={e.id} className="item">
                  <strong>{e.nombre}</strong> <small className="muted">{e.grupo}</small>
                </li>
              ))}
            </ul>
          )}
          <div className="row gap">
            <button className="btn btn-primary" disabled={enviando} onClick={terminar}>
              {enviando ? 'Guardando…' : 'Terminar entrenamiento'}
            </button>
            <button className="btn btn-outline" disabled={enviando} onClick={cancelar}>Cancelar</button>
          </div>
        </>
      )}
    </section>
  );
}


/* ================== Subvista: HISTORIAL ================== */
function Historial({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    const keyHist = `athlete:${usuario?.dni}:historial`;
    const local = JSON.parse(localStorage.getItem(keyHist) || '[]');

    // (opcional) tratar de traer también backend y fusionar por fecha/hora
    (async () => {
      setLoading(true);
      try {
        let remotos = [];
        try {
          const res = await Entrenamientos.listarTodos?.();
          const todos = res?.data ?? res ?? [];
          remotos = todos.filter(e => String(e?.deportista?.dni) === String(usuario?.dni));
        } catch { /* si falla, mostramos solo local */ }

        // Orden: los locales ya traen detalle de ejercicios
        const ordenado = [...local].sort(
          (a, b) =>
            new Date(`${b.fechaEntrenamiento}T${b.horaEntrenamiento || '00:00'}`) -
            new Date(`${a.fechaEntrenamiento}T${a.horaEntrenamiento || '00:00'}`)
        );

        setItems(ordenado);
      } finally {
        setLoading(false);
      }
    })();
  }, [usuario?.dni]);

  const borrar = async (it) => {
    if (!window.confirm('¿Eliminar este entrenamiento del historial?')) return;
    const keyHist = `athlete:${usuario?.dni}:historial`;
    const rest = items.filter(x => x.idLocal !== it.idLocal);
    localStorage.setItem(keyHist, JSON.stringify(rest));
    setItems(rest);

    // si existe en backend, intento borrar
    if (it.backendId) {
      try {
        const base = API_URL || (import.meta?.env?.VITE_API_URL) || 'http://localhost:3000/api';
        await fetch(`${base}/entrenamientos/${it.backendId}`, { method: 'DELETE' });
      } catch { /* best effort */ }
    }
  };

  const filtrados = items.filter(it =>
    q ? (JSON.stringify(it).toLowerCase().includes(q.toLowerCase())) : true
  );

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Historial de entrenamientos</h3>

      <input className="input" placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} />

      {loading ? <p className="muted">Cargando…</p> :
        filtrados.length === 0 ? <p className="muted">No hay entrenamientos guardados.</p> :
          <ul className="list">
            {filtrados.map(it => (
              <li key={it.idLocal} className="item">
                <div className="item-head">
                  <div>
                    <strong>{it.fechaEntrenamiento} {it.horaEntrenamiento || ''}</strong><br />
                    {it.entrenadorNombre && <small className="muted">Entrenador: {it.entrenadorNombre}</small>}
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => borrar(it)}>Borrar</button>
                  </div>
                </div>

                {it.ejercicios?.length ? (
                  <ul className="list" style={{ marginTop: 8 }}>
                    {it.ejercicios.map(ej => (
                      <li key={ej.id} className="item" style={{ background: '#0b1626' }}>
                        <div className="item-head">
                          <div>
                            <strong style={{ textDecoration: ej.eliminado ? 'line-through' : 'none' }}>
                              {ej.nombre}
                            </strong>
                            <br />
                            <small className="muted">
                              {ej.grupo || '—'} {ej.eliminado ? ' • (eliminado en la carga)' : ''}
                            </small>
                          </div>
                        </div>
                        {ej.series?.length ? (
                          <div className="series" style={{ marginTop: 6 }}>
                            {ej.series.map((s, i) => (
                              <div key={i} className="series-row">
                                <span>Serie #{i + 1}</span>
                                <span className="muted">Peso: {s.peso || '—'}</span>
                                <span className="muted">Reps: {s.reps || '—'}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : <small className="muted">Sin ejercicios guardados.</small>}
              </li>
            ))}
          </ul>
      }
    </section>
  );
}

/* ================== Otras subvistas simples ================== */
function TuEntrenador({ onVolver }) {
  const [tiene, setTiene] = useState(false);
  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tu entrenador</h3>
      {!tiene ? (
        <>
          <p className="muted">No tenés entrenador asignado.</p>
          <button className="btn btn-primary" onClick={() => alert('Listado de entrenadores (simulado)')}>Agregar entrenador</button>
        </>
      ) : (
        <>
          <div className="card-box">
            <strong>Entrenador/a: </strong>Nombre Apellido<br />
            <small>Rating: 4.6/5</small>
          </div>
          <div className="row gap">
            <button className="btn btn-primary" onClick={() => alert('Feedback (simulado)')}>Dar feedback</button>
            <button className="btn" onClick={() => alert('Cambiar (simulado)')}>Cambiar</button>
            <button className="btn btn-outline" onClick={() => setTiene(false)}>Dar de baja</button>
          </div>
        </>
      )}
    </section>
  );
}

function Perfil({ onVolver }) {
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; }
    catch { return {}; }
  }, []);
  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tu perfil</h3>
      <div className="card-box">
        <p><strong>Nombre:</strong> {usuario?.nombre ?? '-'}</p>
        <p><strong>Email:</strong> {usuario?.email ?? '-'}</p>
      </div>
      <button className="btn btn-outline" onClick={() => alert('Dar de baja cuenta (simulado)')}>Dar de baja la cuenta</button>
    </section>
  );
}

/* ================== UI ================== */
function Card({ title, desc, onClick }) {
  return (
    <button className="menu-card" onClick={onClick}>
      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>
    </button>
  );
}

function Back({ onClick }) {
  return <button className="btn link" onClick={onClick}>← Volver</button>;
}

export default MenuDeportista;

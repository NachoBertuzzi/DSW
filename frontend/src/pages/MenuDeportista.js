// MenuDeportista.js
import React, { useState, useMemo, useEffect } from 'react';
import SuccessCreated from './SuccessCreated';
import { Entrenamientos, FallbackCoach, API_URL } from '../services/api';
import './styles/MenuDeportista.css';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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

/* ---------- Subvista: AGREGAR (último bloqueado + crear nuevo) ---------- */
function Agregar({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);

  // estado de sesión
  const [enCurso, setEnCurso] = useState(false); // false = viendo último bloqueado, true = cargando uno nuevo
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));
  const [coachName, setCoachName] = useState('');

  // catálogo grupo -> ejercicios
  const GRUPOS_EJERCICIOS = {
    Pecho: ["Press de banca","Press inclinado","Aperturas con mancuernas","Fondos","Pullover","Pec deck","Press declinado","Flexiones","Press máquina","Cruce de cables"],
    Espalda: ["Dominadas","Remo barra","Remo mancuerna","Peso muerto","Jalón al pecho","Pull-over polea","Remo máquina","Hiperextensiones","Encogimientos","Remo al mentón"],
    Hombros: ["Press militar","Elevaciones laterales","Elevaciones frontales","Elevaciones posteriores","Press Arnold","Face pull","Remo al mentón","Encogimiento hombros","Elevación máquina","Pájaros"],
    Bíceps: ["Curl barra","Curl mancuernas","Curl martillo","Curl concentrado","Curl predicador","Curl polea","Curl inverso","Curl alternado","Curl 21s","Zottman"],
    Tríceps: ["Fondos","Press francés","Extensión polea","Patada tríceps","Press cerrado","Skull crusher","Extensión mancuerna","Dips banco","Extensión máquina","Press polea"],
    Piernas: ["Sentadilla barra","Sentadilla frontal","Prensa","Zancadas","Peso muerto rumano","Extensión piernas","Curl piernas","Elevación talones","Hip thrust","Step-ups"],
    Abdominales: ["Crunch","Elevación piernas","Plancha","Plancha lateral","Crunch polea","Ab wheel","Elevación rodillas","Crunch oblicuo","Mountain climbers","Russian twists"]
  };

  // builder
  const [ejercicios, setEjercicios] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantSeries, setCantSeries] = useState(1);

  const [enviando, setEnviando] = useState(false);
  const [asignados, setAsignados] = useState([]);

  // cargar asignados (si algún día los usás)
  useEffect(() => {
    const key = `assigned:${usuario?.dni}`;
    setAsignados(JSON.parse(localStorage.getItem(key) || '[]'));
  }, [usuario?.dni]);

  // Al entrar: si hay último entrenamiento => mostrarlo bloqueado (enCurso=false)
  // si no hay nada => arrancar enCurso=true vacío
  useEffect(() => {
    const keyHist = `athlete:${usuario?.dni}:historial`;
    const arr = JSON.parse(localStorage.getItem(keyHist) || '[]');
    const ultimo = arr?.[0];

    if (ultimo?.ejercicios?.length) {
      const clon = ultimo.ejercicios.map(e => ({
        id: e.id || crypto.randomUUID(),
        nombre: e.nombre || '',
        grupo: e.grupo || '',
        eliminado: !!e.eliminado,
        series: Array.isArray(e.series)
          ? e.series.map(s => ({ peso: s.peso || '', reps: s.reps || '' }))
          : [],
      }));
      setEjercicios(clon);
      setCoachName(ultimo.entrenadorNombre || '');
      setFecha(ultimo.fechaEntrenamiento || new Date().toISOString().slice(0, 10));
      setHora(ultimo.horaEntrenamiento || new Date().toTimeString().slice(0, 5));
      setEnCurso(false); // bloqueado, se puede “Crear nuevo”
    } else {
      setEjercicios([]);
      setEnCurso(true); // no había último => empezá uno nuevo
    }
  }, [usuario?.dni]);

  const nuevoEntrenamiento = () => {
    setEnCurso(true);
    setEjercicios([]);
    setGrupo('');
    setNombre('');
    setCantSeries(1);
    setCoachName('');
    setFecha(new Date().toISOString().slice(0, 10));
    setHora(new Date().toTimeString().slice(0, 5));
  };

  const agregarEjercicio = () => {
    if (!enCurso) return; // bloqueado si es el último
    if (!grupo) return alert('Seleccioná un grupo muscular');
    if (!nombre) return alert('Seleccioná un ejercicio');

    const series = Math.max(1, parseInt(cantSeries, 10) || 1);
    const nuevo = {
      id: crypto.randomUUID(),
      nombre,
      grupo,
      eliminado: false,
      series: Array.from({ length: series }, () => ({ peso: '', reps: '' })),
    };
    setEjercicios(prev => [nuevo, ...prev]);
    setNombre(''); // dejo el grupo para cargar varios del mismo
  };

  const setSerieValor = (idEj, idx, campo, valor) => {
    if (!enCurso) return;
    setEjercicios(prev =>
      prev.map(e =>
        e.id !== idEj
          ? e
          : { ...e, series: e.series.map((s, i) => (i === idx ? { ...s, [campo]: valor } : s)) }
      )
    );
  };

  const eliminarEjercicio = (id) => {
    if (!enCurso) return;
    setEjercicios(prev => prev.filter(e => e.id !== id));
  };

  const terminar = async () => {
    if (!enCurso) return; // ya está cerrado
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (!usuario?.dni) return alert('No se encontró tu DNI en la sesión');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      deportista: { dni: String(usuario.dni) },
    };

    try {
      setEnviando(true);

      let created = null;
      try {
        if (Entrenamientos?.crear) {
          created = await Entrenamientos.crear(payload);
        } else {
          const base = (import.meta?.env?.VITE_API_URL) || process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
          const res = await fetch(`${base}/entrenamientos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          created = await res.json().catch(() => ({}));
        }
      } catch { /* best-effort */ }

      const backendId = created?.data?.id ?? created?.id ?? null;

      const keyHist = `athlete:${usuario?.dni}:historial`;
      const prev = JSON.parse(localStorage.getItem(keyHist) || '[]');
      const item = {
        idLocal: crypto.randomUUID(),
        backendId,
        fechaEntrenamiento: fecha,
        horaEntrenamiento: hora,
        entrenadorNombre: coachName.trim() || null,
        ejercicios: ejercicios.map(e => ({ ...e })),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(keyHist, JSON.stringify([item, ...prev]));

      // Cerramos sesión actual y quedamos mostrando el último
      setEnCurso(false);
      alert('Entrenamiento guardado. Quedó como último. Usá “Crear nuevo entrenamiento” para empezar otro.');
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar en el backend');
    } finally {
      setEnviando(false);
    }
  };

  const disabledAll = !enCurso || enviando;

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Agregar entrenamiento</h3>

      {/* BANNER SUPERIOR */}
      <div className="card-box" style={{ background: '#10223b', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <strong>{enCurso ? 'Cargando nuevo entrenamiento' : 'Viendo el último entrenamiento guardado'}</strong><br/>
            {!enCurso && <small className="muted">Para empezar otro, tocá “Crear nuevo entrenamiento”.</small>}
          </div>
          <button className="btn btn-primary" onClick={nuevoEntrenamiento} disabled={enviando}>
            Crear nuevo entrenamiento
          </button>
        </div>
      </div>

      <div className="row gap">
        <input className="input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} disabled={disabledAll} />
        <input className="input" type="time" value={hora} onChange={e => setHora(e.target.value)} disabled={disabledAll} />
      </div>

      <div className="row gap">
        <input
          className="input"
          placeholder="Nombre del entrenador (opcional)"
          value={coachName}
          onChange={e => setCoachName(e.target.value)}
          disabled={disabledAll}
        />
      </div>

      <div className="row gap wrap">
        <select className="input" value={grupo} onChange={e => { setGrupo(e.target.value); setNombre(''); }} disabled={disabledAll}>
          <option value="">— Seleccioná grupo muscular —</option>
          {Object.keys(GRUPOS_EJERCICIOS).map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select className="input" value={nombre} onChange={e => setNombre(e.target.value)} disabled={!grupo || disabledAll}>
          <option value="">— Seleccioná ejercicio —</option>
          {(grupo ? GRUPOS_EJERCICIOS[grupo] : []).map(ej => <option key={ej} value={ej}>{ej}</option>)}
        </select>

        <input className="input small" type="number" min={1} value={cantSeries} onChange={e => setCantSeries(e.target.value)} placeholder="Cant. series" disabled={disabledAll} />
        <button className="btn btn-primary" onClick={agregarEjercicio} disabled={!nombre || disabledAll}>Agregar</button>
      </div>

      {ejercicios.length === 0 ? (
        <p className="muted" style={{ marginTop: 8 }}>Lista de ejercicios vacía.</p>
      ) : (
        <ul className="list">
          {ejercicios.map(e => (
            <li key={e.id} className="item">
              <div className="item-head">
                <strong>{e.nombre}</strong>
                {enCurso && <button className="btn btn-outline" onClick={() => eliminarEjercicio(e.id)} disabled={disabledAll}>Eliminar</button>}
              </div>
              <small className="muted">{e.grupo || '—'}</small>

              <div className="series" style={{ marginTop: 6 }}>
                {e.series.map((s, i) => (
                  <div key={i} className="series-row">
                    <span>Serie #{i + 1}</span>
                    <input className="input tiny" type="number" placeholder="Peso" value={s.peso} onChange={ev => setSerieValor(e.id, i, 'peso', ev.target.value)} disabled={disabledAll} />
                    <input className="input tiny" type="number" placeholder="Reps" value={s.reps} onChange={ev => setSerieValor(e.id, i, 'reps', ev.target.value)} disabled={disabledAll} />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="row gap">
        <button className="btn btn-primary" disabled={!enCurso || ejercicios.length === 0 || enviando} onClick={terminar}>
          {enviando ? 'Guardando…' : 'Terminar entrenamiento'}
        </button>
        <button className="btn btn-outline" disabled={enviando} onClick={onVolver}>Volver</button>
      </div>
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

    const ordenado = [...local].sort(
      (a, b) =>
        new Date(`${b.fechaEntrenamiento}T${b.horaEntrenamiento || '00:00'}`) -
        new Date(`${a.fechaEntrenamiento}T${a.horaEntrenamiento || '00:00'}`)
    );

    setItems(ordenado);
    setLoading(false);
  }, [usuario?.dni]);

  const borrar = (it) => {
    if (!window.confirm('¿Eliminar este entrenamiento del historial?')) return;
    const keyHist = `athlete:${usuario?.dni}:historial`;
    const rest = items.filter(x => x.idLocal !== it.idLocal);
    localStorage.setItem(keyHist, JSON.stringify(rest));
    setItems(rest);
  };

  const filtrados = items.filter(it =>
    q ? JSON.stringify(it).toLowerCase().includes(q.toLowerCase()) : true
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

/* ================== Tu Entrenador ================== */
function TuEntrenador({ onVolver }) {
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
  }, []);

  const KEY_COACH = `athlete:${usuario?.dni}:coach`;

  const [coach, setCoach] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY_COACH)) || null; } catch { return null; }
  });

  const [lista, setLista] = useState([]);
  const [qEsp, setQEsp] = useState('');
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState(coach ? 'ver' : 'elegir'); // ver | elegir

  // notas
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState([]);

  // 1) Traer entrenadores (API -> fallback)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/entrenadores`);
        const json = await res.json().catch(() => ({}));
        const arr = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
        if (arr.length) setLista(arr);
        else setLista((FallbackCoach?.getTodos && FallbackCoach.getTodos()) || []);
      } catch {
        setLista((FallbackCoach?.getTodos && FallbackCoach.getTodos()) || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Si ya había vínculo previo, me aseguro en fallback y traigo notas
  useEffect(() => {
    if (!coach?.dni || !usuario?.dni) return;
    try {
      const arr = FallbackCoach.getLista(coach.dni) || [];
      const existe = arr.some(d => String(d.dni) === String(usuario.dni));
      if (!existe) {
        FallbackCoach.addDeportista(coach.dni, {
          dni: usuario.dni,
          username: usuario.usuario || usuario.username || null,
          nombre: usuario.nombre || null,
        });
      }
      setNotas(FallbackCoach.getNotas(coach.dni, usuario.dni));
    } catch {}
  }, [coach?.dni, usuario?.dni, usuario?.nombre, usuario?.username, usuario?.usuario]);

  const asignar = async (ent) => {
    try {
      await fetch(`${API_URL}/deportistas/${usuario?.dni}/entrenador`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrenadorDni: ent.dni })
      }).catch(() => {});
    } catch {}

    if (coach?.dni) {
      try { FallbackCoach.quitarPorDni(coach.dni, usuario?.dni); } catch {}
    }
    try {
      FallbackCoach.addDeportista(ent.dni, {
        dni: usuario?.dni,
        username: usuario?.usuario || usuario?.username || null,
        nombre: usuario?.nombre || null,
      });
    } catch {}

    localStorage.setItem(KEY_COACH, JSON.stringify(ent));
    setCoach(ent);
    setModo('ver');
    setNotas(FallbackCoach.getNotas(ent.dni, usuario.dni));
    alert('Entrenador asignado');
  };

  const baja = async () => {
    if (!window.confirm('¿Seguro que querés dar de baja a tu entrenador?')) return;

    try {
      await fetch(`${API_URL}/deportistas/${usuario?.dni}/entrenador`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrenadorDni: null })
      }).catch(() => {});
    } catch {}

    if (coach?.dni) {
      try { FallbackCoach.quitarPorDni(coach.dni, usuario?.dni); } catch {}
    }

    localStorage.removeItem(KEY_COACH);
    setCoach(null);
    setNotas([]);
    setModo('elegir');
  };

  const cambiar = () => {
    setModo('elegir');
    window.scrollTo(0, 0);
  };

  const feedback = () => {
    alert('Feedback y puntaje: no implementado todavía.');
  };

  const enviarNota = () => {
    const t = nota.trim();
    if (!t) return alert('Escribí una nota');
    if (!coach?.dni || !usuario?.dni) return;

    try {
      FallbackCoach.setNota(coach.dni, usuario.dni, t);
      setNota('');
      setNotas(FallbackCoach.getNotas(coach.dni, usuario.dni));
      alert('Nota enviada a tu entrenador');
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar la nota');
    }
  };

  const filtrados = lista
    .filter(e => qEsp ? String(e.especialidad || '').toLowerCase().includes(qEsp.toLowerCase()) : true)
    .sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tu entrenador</h3>

      {coach && modo === 'ver' ? (
        <>
          <div className="card-box">
            <p><strong>Entrenador/a:</strong> {coach?.nombre || '-'} {coach?.apellido || ''}</p>
            <p><strong>Especialidad:</strong> {coach?.especialidad || '-'}</p>
            <p><strong>Email:</strong> {coach?.email || '-'}</p>
          </div>

          <div className="card-box">
            <p><strong>Dejar una nota para tu entrenador</strong></p>
            <textarea
              className="input"
              rows={3}
              placeholder="Ej: La semana que viene me gustaría hacer 3 entrenamientos de fuerza…"
              value={nota}
              onChange={(e)=>setNota(e.target.value)}
            />
            <div className="row gap" style={{ marginTop: 8 }}>
              <button type="button" className="btn btn-primary" onClick={enviarNota}>Enviar nota</button>
            </div>
            {notas?.length > 0 && (
              <>
                <p style={{ marginTop: 12 }}><small className="muted">Tus notas recientes</small></p>
                <ul className="list">
                  {notas.slice(-3).reverse().map(n=>(
                    <li key={n.id} className="item">
                      <div><small className="muted">{new Date(n.fecha).toLocaleString()}</small></div>
                      <div>{n.texto}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="row gap">
            <button type="button" className="btn btn-primary" onClick={feedback}>Dar feedback</button>
            <button type="button" className="btn" onClick={cambiar}>Cambiar entrenador</button>
            <button type="button" className="btn btn-outline" onClick={baja}>Dar de baja entrenador</button>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="btn link" onClick={onVolver}>← Volver</button>
          </div>
        </>
      ) : (
        <>
          {!coach && <p className="muted">No tenés entrenador asignado.</p>}

          <div className="row gap wrap">
            <input
              className="input"
              placeholder="Filtrar por especialidad (p. ej. Fuerza, Hipertrofia, Running)…"
              value={qEsp}
              onChange={(e) => setQEsp(e.target.value)}
            />
            <button className="btn btn-outline" onClick={() => setQEsp('')}>Limpiar filtro</button>
          </div>

          {loading ? (
            <p className="muted">Cargando entrenadores…</p>
          ) : filtrados.length === 0 ? (
            <p className="muted">No se encontraron entrenadores para ese filtro.</p>
          ) : (
            <ul className="list">
              {filtrados.map((e) => (
                <li key={e.dni || e.id} className="item">
                  <div className="item-head">
                    <div>
                      <strong>{e.nombre || '-'} {e.apellido || ''}</strong>
                      <div><small className="muted">DNI/ID: {e.dni || e.id || '—'}</small></div>
                    </div>
                    <button className="btn btn-primary" onClick={() => asignar(e)}>Elegir</button>
                  </div>
                  <div>
                    <small className="muted">
                      Especialidad: {e.especialidad || '—'}{e.email ? ` · ${e.email}` : ''}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="row gap">
            <button type="button" className="btn btn-outline" onClick={onVolver}>Volver</button>
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
      const res = await fetch(`${API_URL}/deportistas/${usuario.dni}`, {
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
      const deleteRes = await fetch(`${API_URL}/deportistas/eliminar`, {
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

/* ================== UI ================== */
function Card({ title, desc, onClick }) {
  return (
    <button
      type="button"
      className="menu-card"
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
    >
      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>
    </button>
  );
}

function Back({ onClick }) {
  return <button className="btn link" onClick={onClick}>← Volver</button>;
}

export default MenuDeportista;

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

/* ---------- Subvista: AGREGAR (UI renovada) ---------- */
function Agregar({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);

  // Estado general
  const [enCurso, setEnCurso] = useState(false); // al entrar: false → sólo botón
  const [modo, setModo] = useState('propio');    // propio | asignado

  // Datos del entrenamiento
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));

  // Builder
  const GRUPOS_EJERCICIOS = {
    Pecho: ["Press de banca","Press inclinado","Aperturas con mancuernas","Fondos","Pullover","Pec deck","Press declinado","Flexiones","Press máquina","Cruce de cables"],
    Espalda: ["Dominadas","Remo barra","Remo mancuerna","Peso muerto","Jalón al pecho","Pull-over polea","Remo máquina","Hiperextensiones","Encogimientos","Remo al mentón"],
    Hombros: ["Press militar","Elevaciones laterales","Elevaciones frontales","Elevaciones posteriores","Press Arnold","Face pull","Remo al mentón","Encogimiento hombros","Elevación máquina","Pájaros"],
    Bíceps: ["Curl barra","Curl mancuernas","Curl martillo","Curl concentrado","Curl predicador","Curl polea","Curl inverso","Curl alternado","Curl 21s","Zottman"],
    Tríceps: ["Fondos","Press francés","Extensión polea","Patada tríceps","Press cerrado","Skull crusher","Extensión mancuerna","Dips banco","Extensión máquina","Press polea"],
    Piernas: ["Sentadilla barra","Sentadilla frontal","Prensa","Zancadas","Peso muerto rumano","Extensión piernas","Curl piernas","Elevación talones","Hip thrust","Step-ups"],
    Abdominales: ["Crunch","Elevación piernas","Plancha","Plancha lateral","Crunch polea","Ab wheel","Elevación rodillas","Crunch oblicuo","Mountain climbers","Russian twists"]
  };

  const [ejercicios, setEjercicios] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantSeries, setCantSeries] = useState(1);

  // Asignados (si existieran)
  const [asignados, setAsignados] = useState([]);

  // Modal éxito
  const [okModal, setOkModal] = useState(false);

  useEffect(() => {
    // Carga “asignados” si usás ese storage (no mostramos último entrenamiento)
    const key = `assigned:${usuario?.dni}`;
    setAsignados(JSON.parse(localStorage.getItem(key) || '[]'));
  }, [usuario?.dni]);

  const nuevoEntrenamiento = () => {
    setEnCurso(true);
    setModo('propio');
    setFecha(new Date().toISOString().slice(0, 10));
    setHora(new Date().toTimeString().slice(0, 5));
    setEjercicios([]);
    setGrupo('');
    setNombre('');
    setCantSeries(1);
  };

  const clampNonNeg = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const agregarEjercicio = () => {
    if (!enCurso) return;
    if (!grupo) return alert('Seleccioná un grupo');
    if (!nombre.trim()) return alert('Completá el ejercicio');

    const series = Math.max(1, parseInt(cantSeries, 10) || 1);
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      grupo,
      eliminado: false,
      series: Array.from({ length: series }, () => ({ peso: '', reps: '' })),
    };
    setEjercicios((p) => [...p, nuevo]); // 👉 builder queda abajo; agregamos al final
    setNombre('');
  };

  const setSerieValor = (idEj, idx, campo, valor) => {
    if (!enCurso) return;
    setEjercicios((prev) =>
      prev.map((e) =>
        e.id !== idEj
          ? e
          : {
              ...e,
              series: e.series.map((s, i) =>
                i === idx
                  ? {
                      ...s,
                      [campo]: campo === 'peso' || campo === 'reps' ? String(clampNonNeg(valor)) : valor,
                    }
                  : s
              ),
            }
      )
    );
  };

  const eliminarEjercicio = (id) => {
    if (!enCurso) return;
    setEjercicios((p) => p.filter((e) => e.id !== id));
  };

  const terminar = async () => {
    if (!enCurso) return;
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (!usuario?.dni) return alert('No se encontró tu DNI');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      deportista: { dni: String(usuario.dni) },
    };

    try {
      await Entrenamientos.crear?.(payload);
    } catch {
      try {
        const base = (import.meta?.env?.VITE_API_URL) || API_URL || 'http://localhost:3000/api';
        const r = await fetch(`${base}/entrenamientos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
      } catch (e) {
        console.error(e);
        alert('No se pudo guardar en el backend');
        return;
      }
    }

    // Guardar en historial local
    const keyHist = `athlete:${usuario?.dni}:historial`;
    const prev = JSON.parse(localStorage.getItem(keyHist) || '[]');
    const item = {
      idLocal: crypto.randomUUID(),
      backendId: null,
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      entrenadorNombre: null,
      ejercicios: ejercicios.map((e) => ({ ...e })),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(keyHist, JSON.stringify([item, ...prev]));

    setOkModal(true); // Mostrar modal de éxito
  };

  const disabledAll = !enCurso;

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Agregar entrenamiento</h3>

      {/* Banner superior */}
      <div className="card-box" style={{ background: '#10223b', marginBottom: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <strong>{enCurso ? 'Cargando nuevo entrenamiento' : '¿Listo para crear un entrenamiento?'}</strong><br />
            {!enCurso && <small className="muted">Tocá “Crear nuevo entrenamiento” para empezar.</small>}
          </div>
          <button className="btn btn-hero" onClick={nuevoEntrenamiento}>
            <span className="btn-hero-glow" />
            <span className="btn-hero-icon">＋</span>
                Crear nuevo entrenamiento
          </button>
        </div>
      </div>

      {/* Resto del formulario solo si está enCurso */}
      {enCurso && (
        <>
          {/* Modo propio | asignado */}
          <div className="row gap" style={{ marginBottom: 8 }}>
            <button
              type="button"
              className={`btn ${modo === 'propio' ? 'btn-primary' : ''}`}
              onClick={() => setModo('propio')}
            >
              Opción 1: Propio
            </button>
            <button
              type="button"
              className={`btn ${modo === 'asignado' ? 'btn-primary' : ''}`}
              onClick={() => setModo('asignado')}
            >
              Opción 2: Asignado
            </button>
          </div>

          {/* Fecha y hora */}
          <div className="row gap">
            <input
              className="input"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={disabledAll}
            />
            <input
              className="input"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              disabled={disabledAll}
            />
          </div>

          {/* Contenido por modo */}
          {modo === 'propio' ? (
            <>
              {/* Lista de ejercicios agregados */}
              {ejercicios.length === 0 ? (
                <p className="muted" style={{ marginTop: 8 }}>Aún no agregaste ejercicios.</p>
              ) : (
                <ul className="list" style={{ marginTop: 8 }}>
                  {ejercicios.map((e) => (
                    <li key={e.id} className="item">
                      <div className="item-head">
                        <div>
                          <strong>{e.nombre}</strong><br />
                          <small className="muted">{e.grupo || '—'}</small>
                        </div>
                        <button className="btn btn-outline" onClick={() => eliminarEjercicio(e.id)}>
                          Eliminar
                        </button>
                      </div>

                      <div className="series" style={{ marginTop: 6 }}>
                        {e.series.map((s, i) => (
                          <div key={i} className="series-row">
                            <span>Serie #{i + 1}</span>
                            <input
                              className="input tiny"
                              type="number"
                              min={0}
                              step="any"
                              placeholder="Peso"
                              value={s.peso}
                              onChange={(ev) => setSerieValor(e.id, i, 'peso', ev.target.value)}
                            />
                            <input
                              className="input tiny"
                              type="number"
                              min={0}
                              placeholder="Reps"
                              value={s.reps}
                              onChange={(ev) => setSerieValor(e.id, i, 'reps', ev.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Builder ABAJO de todo */}
              <div className="card-box" style={{ marginTop: 12 }}>
                <div className="row gap wrap">
                  <select
                    className="input"
                    value={grupo}
                    onChange={(e) => { setGrupo(e.target.value); setNombre(''); }}
                  >
                    <option value="">— Seleccioná grupo muscular —</option>
                    {Object.keys(GRUPOS_EJERCICIOS).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="Otros">Otros</option>
                  </select>

                  {/* Si es "Otros" → input libre; si no, dropdown */}
                  {grupo === 'Otros' ? (
                    <input
                      className="input"
                      placeholder="Escribí el ejercicio…"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  ) : (
                    <select
                      className="input"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={!grupo}
                    >
                      <option value="">— Seleccioná ejercicio —</option>
                      {(grupo ? GRUPOS_EJERCICIOS[grupo] || [] : []).map((ej) => (
                        <option key={ej} value={ej}>{ej}</option>
                      ))}
                    </select>
                  )}

                  <input
                    className="input small"
                    type="number"
                    min={1}
                    value={cantSeries}
                    onChange={(e) => setCantSeries(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    placeholder="Cant. series"
                  />
                  <button className="btn btn-primary" onClick={agregarEjercicio}>
                    Agregar
                  </button>
                </div>
              </div>

              <div className="row gap" style={{ marginTop: 12 }}>
                <button
                  className="btn btn-primary"
                  disabled={ejercicios.length === 0}
                  onClick={terminar}
                >
                  Terminar entrenamiento
                </button>
                <button className="btn btn-outline" onClick={onVolver}>Volver</button>
              </div>
            </>
          ) : (
            <>
              {/* Modo asignado (placeholder/tu fuente real) */}
              {asignados.length === 0 ? (
                <div className="placeholder" style={{ marginTop: 8 }}>(No hay ejercicios asignados todavía.)</div>
              ) : (
                <ul className="list" style={{ marginTop: 8 }}>
                  {asignados.map((e) => (
                    <li key={e.id} className="item">
                      <div className="item-head"><strong>{e.nombre}</strong></div>
                      <small className="muted">{e.grupo || '—'}</small>
                    </li>
                  ))}
                </ul>
              )}

              <div className="row gap" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={terminar}>Terminar entrenamiento</button>
                <button className="btn btn-outline" onClick={onVolver}>Volver</button>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal éxito */}
      {okModal && (
  <div className="modal-overlay">
    <div className="modal-success">
      <div className="modal-success-badge">✔</div>
      <h4>¡Entrenamiento creado con éxito!</h4>
      <p className="muted">
        Tu entrenamiento fue guardado correctamente.
      </p>
      <div className="modal-actions">
        <button
          className="btn btn-primary"
          onClick={() => { setOkModal(false); onVolver(); }}
        >
          Continuar
        </button>
      </div>
      {/* Brillos decorativos */}
      <span className="spark s1" />
      <span className="spark s2" />
      <span className="spark s3" />
    </div>
  </div>
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

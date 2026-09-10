import React, { useState, useMemo, useEffect } from 'react';
import SuccessCreated from './SuccessCreated';
import CoachChat from '../components/CoachChat';
import { Entrenamientos, FallbackCoach, API_URL } from '../services/api';
import './styles/MenuDeportista.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

function MenuDeportista({ onLogout }) {
  const [vista, setVista] = useState('home'); 
  const [menuAbierto, setMenuAbierto] = useState(false);
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
  }, []);

  return (
    <div className="menu-screen">
      <h2>Menú principal</h2>
      <div className="success-block" style={{ pointerEvents: 'none' }}>
        <SuccessCreated />
      </div>

      <div className="header-actions">
        <small>{usuario?.nombre ? `Hola, ${usuario.nombre}` : ''}</small>
        <div className={`dropdown-header ${menuAbierto ? 'is-open' : ''}`}>
          <button
            type="button"
            className="hamburger-header"
            aria-expanded={menuAbierto}
            aria-label="Abrir menú de usuario"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >&#9776;</button>
          <div className="dropdown-content-header">
            <button type="button" className="btn" onClick={() => { setVista('perfil'); setMenuAbierto(false); }}>Ver mi perfil</button>
            <button type="button" className="btn btn-outline" onClick={() => { setMenuAbierto(false); onLogout(); }}>Cerrar sesión</button>
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
      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} onLogout={onLogout} />}
      <CoachChat />
    </div>
  );
}

function Agregar({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);

  const [modo, setModo] = useState('propio');    // propio | asignado

  const [enCursoPropio, setEnCursoPropio] = useState(false);
  const [inicioPropio, setInicioPropio] = useState(null);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));

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
  const [cantSeries, setCantSeries] = useState('');

  const [okModal, setOkModal] = useState(false);

  const [asignados, setAsignados] = useState([]);
  const [loadingAsignados, setLoadingAsignados] = useState(true);
  const [qAsignados, setQAsignados] = useState('');

  const [enCursoAsig, setEnCursoAsig] = useState(false);
  const [asigActiva, setAsigActiva] = useState(null);        
  const [ejerciciosAsig, setEjerciciosAsig] = useState([]);  

  const clampNonNeg = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  useEffect(() => {
    if (!usuario?.dni) {
      setAsignados([]);
      setLoadingAsignados(false);
      return;
    }
    (async () => {
      setLoadingAsignados(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/asignaciones-entrenamientos/deportistas/${usuario.dni}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json().catch(() => ({}));
        const arr = Array.isArray(json?.data) ? json.data : [];
        setAsignados(arr);
      } catch (e) {
        console.error(e);
        setAsignados([]);
      } finally {
        setLoadingAsignados(false);
      }
    })();
  }, [usuario?.dni]);

  const nuevoEntrenamientoPropio = () => {
    setEnCursoPropio(true);
    setInicioPropio(Date.now());
    setModo('propio');
    setFecha(new Date().toISOString().slice(0, 10));
    setHora(new Date().toTimeString().slice(0, 5));
    setEjercicios([]);
    setGrupo('');
    setNombre('');
    setCantSeries(1);
  };

  const agregarEjercicio = () => {
    if (!enCursoPropio) return;
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
    setEjercicios((p) => [...p, nuevo]);
    setNombre('');
  };

  const setSerieValor = (idEj, idx, campo, valor) => {
    setEjercicios((prev) =>
      prev.map((e) =>
        e.id !== idEj
          ? e
          : {
              ...e,
              series: e.series.map((s, i) =>
                i === idx
                  ? { ...s, [campo]: campo === 'peso' || campo === 'reps' ? String(clampNonNeg(valor)) : valor }
                  : s
              ),
            }
      )
    );
  };

  const setCantidadSeriesPropio = (idEj, val) => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setEjercicios(prev =>
      prev.map(e => {
        if (e.id !== idEj) return e;
        let series = e.series;

        if (n > series.length) {
          series = [
            ...series,
            ...Array.from({ length: n - series.length }, () => ({ peso: '', reps: '' })),
          ];
        } else if (n < series.length) {
          series = series.slice(0, n);
        }
        return { ...e, series };
      })
    );
  };

  const eliminarEjercicio = (id) => {
    setEjercicios((p) => p.filter((e) => e.id !== id));
  };

  const terminarPropio = async () => {
    if (!enCursoPropio) return;
    if (!fecha) return alert('Completá la fecha');
    if (!usuario?.dni) return alert('No se encontró tu DNI');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: (hora && /^\d{2}:\d{2}$/.test(hora)) ? hora : undefined,
      ejercicios: ejercicios.map((e) => ({ ...e })),
      duracionSegundos: inicioPropio ? Math.max(0, Math.round((Date.now() - inicioPropio) / 1000)) : null,
      estado: 'completado',
      deportista: { dni: String(usuario.dni) },
    };

    try {
      await Entrenamientos.crear(payload);
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar en el backend');
      return;
    }

    setOkModal(true);
  };

  const parseNotas = (notas) => {
    if (!notas) return [];
    return String(notas)
      .split('|')
      .map(s => s.trim())
      .filter(Boolean)
      .map(txt => {
        const [g, ...rest] = txt.split(':');
        const nom = rest.join(':').trim();
        return {
          id: crypto.randomUUID(),
          grupo: (g || '').trim() || '—',
          nombre: nom || txt,
          series: Array.from({ length: 3 }, () => ({ peso: '', reps: '' })), 
        };
      });
  };

  const empezarAsignado = (a) => {
    setModo('asignado');
    setAsigActiva(a);
    setEjerciciosAsig(parseNotas(a?.notas));
    setEnCursoAsig(true);
  };

  const setCantidadSeriesAsig = (idEj, val) => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setEjerciciosAsig(prev =>
      prev.map(e => {
        if (e.id !== idEj) return e;
        let series = e.series;

        if (n > series.length) {
          series = [
            ...series,
            ...Array.from({ length: n - series.length }, () => ({ peso: '', reps: '' })),
          ];
        } else if (n < series.length) {
          series = series.slice(0, n);
        }
        return { ...e, series };
      })
    );
  };

  const setSerieValorAsig = (idEj, idx, campo, valor) => {
    setEjerciciosAsig((prev) =>
      prev.map((e) =>
        e.id !== idEj
          ? e
          : {
              ...e,
              series: e.series.map((s, i) =>
                i === idx
                  ? { ...s, [campo]: campo === 'peso' || campo === 'reps' ? String(clampNonNeg(valor)) : valor }
                  : s
              ),
            }
      )
    );
  };

  const terminarAsignado = async () => {
    if (!enCursoAsig || !asigActiva) return;
    if (ejerciciosAsig.length === 0) return alert('No hay ejercicios para cargar');

    const fechaUi = asigActiva?.entrenamiento?.fechaEntrenamiento || asigActiva?.fecha || new Date().toISOString().slice(0,10);
    const horaUi  = asigActiva?.entrenamiento?.horaEntrenamiento || null;

    const item = {
      idLocal: crypto.randomUUID(),
      backendId: asigActiva?.entrenamiento?.id || null,
      asignacionId: asigActiva?.id || null,
      fechaEntrenamiento: fechaUi,
      horaEntrenamiento: horaUi,
      entrenadorNombre: asigActiva?.entrenador?.nombre || asigActiva?.entrenador?.dni || null,
      ejercicios: ejerciciosAsig.map((e) => ({ ...e })),
      duracionSegundos: null,
      estado: 'completado',
      createdAt: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      if (asigActiva?.entrenamiento?.id) {
        await fetch(`${API_URL}/entrenamientos/${asigActiva.entrenamiento.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ ejercicios: item.ejercicios, estado: 'completado' }),
        });
      }
      await fetch(`${API_URL}/asignaciones-entrenamientos/${asigActiva.id}/estado`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ estado: 'completado' }),
      }).catch(() => {});
    } catch {}

    alert('¡Entrenamiento asignado registrado!');
    setEnCursoAsig(false);
    setAsigActiva(null);
    setEjerciciosAsig([]);
    setAsignados(prev => prev.map(x => x.id === item.asignacionId ? { ...x, estado: 'completado' } : x));
  };

  const renderListaSeries = (lista, onChange) => (
    <div className="series" style={{ marginTop: 6 }}>
      {lista.map((s, i) => (
        <div key={i} className="series-row">
          <span>Serie #{i + 1}</span>
          <input
            className="input tiny"
            type="number"
            min={0}
            step="any"
            placeholder="Peso"
            value={s.peso}
            onChange={(ev) => onChange('peso', i, ev.target.value)}
          />
          <input
            className="input tiny"
            type="number"
            min={0}
            placeholder="Reps"
            value={s.reps}
            onChange={(ev) => onChange('reps', i, ev.target.value)}
          />
        </div>
      ))}
    </div>
  );

  const asignadosFiltrados = (asignados || []).filter(a => {
    if (!qAsignados) return true;
    const txt = `${a?.entrenador?.nombre || ''} ${a?.entrenamiento?.fechaEntrenamiento || ''} ${a?.notas || ''} ${a?.estado || ''}`.toLowerCase();
    return txt.includes(qAsignados.toLowerCase());
  });

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Agregar entrenamiento</h3>

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

      {modo === 'propio' ? (
        <>
          <div className="card-box" style={{ background: '#10223b', marginBottom: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <strong>{enCursoPropio ? 'Cargando nuevo entrenamiento' : '¿Listo para crear un entrenamiento?'}</strong><br />
                {!enCursoPropio && <small className="muted">Tocá “Crear nuevo entrenamiento” para empezar.</small>}
              </div>
              <button className="btn btn-hero" onClick={nuevoEntrenamientoPropio}>
                <span className="btn-hero-glow" />
                <span className="btn-hero-icon">＋</span>
                Crear nuevo entrenamiento
              </button>
            </div>
          </div>

          {enCursoPropio && (
            <>
              <div className="row gap">
                <div className="col">
                  <label className="muted" style={{ display: 'block', marginBottom: 4 }}>Fecha</label>
                  <input className="input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
                <div className="col">
                  <label className="muted" style={{ display: 'block', marginBottom: 4 }}>Hora (opcional)</label>
                  <input className="input" type="time" value={hora} onChange={(e) => setHora(e.target.value)} placeholder="hh:mm" />
                </div>
              </div>

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
                        <button className="btn btn-outline" onClick={() => eliminarEjercicio(e.id)}>Eliminar</button>
                      </div>
                      <div className="row gap align-center" style={{ marginTop: 6 }}>
                        <label className="muted">Cantidad de series</label>
                        <input
                          className="input tiny"
                          type="number"
                          min={1}
                          value={e.series.length}
                          onChange={(ev) => setCantidadSeriesPropio(e.id, ev.target.value)}
                          style={{ width: 90 }}
                          aria-label="Cantidad de series"
                          title="Elegí cuántas series vas a cargar para este ejercicio"
                        />
                      </div>
                      {renderListaSeries(e.series, (campo, idx, val) => setSerieValor(e.id, idx, campo, val))}
                    </li>
                  ))}
                </ul>
              )}

              <div className="card-box" style={{ marginTop: 12 }}>
                <div className="row gap wrap align-start">
                  <select className="input" value={grupo} onChange={(e) => { setGrupo(e.target.value); setNombre(''); }}>
                    <option value="">— Seleccioná grupo muscular —</option>
                    {Object.keys(GRUPOS_EJERCICIOS).map((g) => (<option key={g} value={g}>{g}</option>))}
                    <option value="Otros">Otros</option>
                  </select>

                  {grupo === 'Otros' ? (
                    <input className="input" placeholder="Escribí el ejercicio…" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  ) : (
                    <select className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={!grupo}>
                      <option value="">— Seleccioná ejercicio —</option>
                      {(grupo ? GRUPOS_EJERCICIOS[grupo] || [] : []).map((ej) => (<option key={ej} value={ej}>{ej}</option>))}
                    </select>
                  )}

                  <div className="series-wrap">
                    <input
                      className="input series-input"
                      type="number"
                      min={1}
                      value={cantSeries === '' ? '' : String(cantSeries)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') setCantSeries('');
                        else {
                          const n = parseInt(val, 10);
                          if (!isNaN(n) && n > 0) setCantSeries(n);
                        }
                      }}
                      placeholder="Series"
                    />
                    <small className="series-help">
                      Indicá cuántas series hiciste para este ejercicio.
                    </small>
                  </div>

                  <button className="btn btn-primary" type="button" onClick={agregarEjercicio}>
                    Agregar
                  </button>
                </div>
              </div>

              <div className="row gap" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" disabled={ejercicios.length === 0} onClick={terminarPropio}>
                  Terminar entrenamiento
                </button>
                <button className="btn btn-outline" onClick={() => setEnCursoPropio(false)}>Cancelar</button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {!enCursoAsig ? (
            <>
              <div className="row gap wrap" style={{ marginBottom: 8 }}>
                <input
                  className="input"
                  placeholder="Buscar por fecha/entrenador/notas…"
                  value={qAsignados}
                  onChange={(e) => setQAsignados(e.target.value)}
                  style={{ minWidth: 240 }}
                />
              </div>

              {loadingAsignados ? (
                <p className="muted">Cargando asignaciones…</p>
              ) : asignadosFiltrados.length === 0 ? (
                <div className="placeholder" style={{ marginTop: 8 }}>
                  (No hay entrenamientos asignados todavía.)
                </div>
              ) : (
                <ul className="list" style={{ marginTop: 8 }}>
                  {asignadosFiltrados.map((a) => (
                    <li key={a.id} className="item">
                      <div className="item-head">
                        <div>
                          <strong>
                            {a?.entrenamiento?.fechaEntrenamiento || a?.fecha || '—'} {' '}
                            {a?.entrenamiento?.horaEntrenamiento || ''}
                          </strong><br />
                          <small className="muted">
                            Entrenador: {a?.entrenador?.nombre || a?.entrenador?.dni || '—'} · Estado: {a?.estado || 'pendiente'}
                          </small>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => empezarAsignado(a)}
                          disabled={a?.estado === 'completado'}
                        >
                          {a?.estado === 'completado' ? 'Completado' : 'Empezar'}
                        </button>
                      </div>
                      {a?.notas && (
                        <div style={{ marginTop: 6 }}>
                          <small className="muted">Notas:</small>
                          <div>{a.notas}</div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <div className="card-box" style={{ background: '#10223b', marginBottom: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>Entrenamiento asignado en curso</strong><br />
                    <small className="muted">
                      {asigActiva?.entrenamiento?.fechaEntrenamiento || asigActiva?.fecha || '—'}{' '}
                      {asigActiva?.entrenamiento?.horaEntrenamiento || ''}
                    </small>
                  </div>
                  <button className="btn btn-outline" onClick={() => { setEnCursoAsig(false); setAsigActiva(null); setEjerciciosAsig([]); }}>
                    Cancelar
                  </button>
                </div>
              </div>

              {ejerciciosAsig.length === 0 ? (
                <p className="muted" style={{ marginTop: 8 }}>No hay ejercicios en esta asignación.</p>
              ) : (
                <ul className="list" style={{ marginTop: 8 }}>
                  {ejerciciosAsig.map((e) => (
                    <li key={e.id} className="item">
                      <div className="item-head">
                        <div>
                          <strong>{e.nombre}</strong><br />
                          <small className="muted">{e.grupo || '—'}</small>
                        </div>
                      </div>
                      <div className="row gap align-center" style={{ marginTop: 6 }}>
                        <label className="muted">Cantidad de series</label>
                        <input
                          className="input tiny"
                          type="number"
                          min={1}
                          value={e.series.length}
                          onChange={(ev) => setCantidadSeriesAsig(e.id, ev.target.value)}
                          style={{ width: 90 }}
                          aria-label="Cantidad de series"
                          title="Elegí cuántas series vas a cargar para este ejercicio"
                        />
                      </div>
                      {renderListaSeries(e.series, (campo, idx, val) =>
                        setSerieValorAsig(e.id, idx, campo, val)
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="row gap" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={terminarAsignado}>
                  Terminar entrenamiento
                </button>
                <button className="btn btn-outline" onClick={() => { setEnCursoAsig(false); setAsigActiva(null); setEjerciciosAsig([]); }}>
                  Volver
                </button>
              </div>
            </>
          )}
        </>
      )}

      {okModal && (
        <div className="modal-overlay">
          <div className="modal-success">
            <div className="modal-success-badge">✔</div>
            <h4>¡Entrenamiento creado con éxito!</h4>
            <p className="muted">Tu entrenamiento fue guardado correctamente.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { setOkModal(false); onVolver(); }}>
                Continuar
              </button>
            </div>
            <span className="spark s1" />
            <span className="spark s2" />
            <span className="spark s3" />
          </div>
        </div>
      )}
    </section>
  );
}

function Historial({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await Entrenamientos.listarTodos();
        const remotos = (data?.data || [])
          .filter((ent) => String(ent?.deportista?.dni) === String(usuario?.dni))
          .map((ent) => ({
            ...ent,
            idLocal: `backend-${ent.id}`,
            backendId: ent.id,
            ejercicios: ent.ejercicios || [],
          }));
        const ordenado = remotos.sort((a, b) =>
          new Date(`${b.fechaEntrenamiento}T${b.horaEntrenamiento || '00:00'}`) -
          new Date(`${a.fechaEntrenamiento}T${a.horaEntrenamiento || '00:00'}`)
        );
        setItems(ordenado);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [usuario?.dni]);

  const borrar = async (it) => {
    if (!window.confirm('¿Eliminar este entrenamiento del historial?')) return;
    try {
      await Entrenamientos.eliminar(it.backendId || it.id);
      setItems(items.filter(x => x.idLocal !== it.idLocal));
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el entrenamiento');
    }
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
  const [modo, setModo] = useState(coach ? 'ver' : 'elegir'); 

  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/entrenadores`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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

  useEffect(() => {
    if (!usuario?.dni) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/deportistas/${usuario.dni}/entrenador`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const remoto = json?.data || null;
        setCoach(remoto);
        setModo(remoto ? 'ver' : 'elegir');
        if (remoto) localStorage.setItem(KEY_COACH, JSON.stringify(remoto));
        else localStorage.removeItem(KEY_COACH);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [KEY_COACH, usuario?.dni]);

  useEffect(() => {
    if (!coach?.dni || !usuario?.dni) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/notas/deportistas/${usuario.dni}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        setNotas(Array.isArray(json?.data) ? json.data : []);
      } catch (error) {
        console.error(error);
        setNotas([]);
      }
    })();
  }, [coach?.dni, usuario?.dni, usuario?.nombre, usuario?.username, usuario?.usuario]);

  const asignar = async (ent) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/deportistas/${usuario?.dni}/entrenador`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    setNotas([]);
    alert('Entrenador asignado');
  };

  const baja = async () => {
    if (!window.confirm('¿Seguro que querés dar de baja a tu entrenador?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/deportistas/${usuario?.dni}/entrenador`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  

  const enviarNota = async () => {
    const t = nota.trim();
    if (!t) return alert('Escribí una nota');
    if (!coach?.dni || !usuario?.dni) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entrenadorDni: coach.dni, deportistaDni: usuario.dni, texto: t }),
      });
      if (!res.ok) throw new Error('No se pudo guardar la nota');
      setNota('');
      const actualizadas = await fetch(`${API_URL}/notas/deportistas/${usuario.dni}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await actualizadas.json().catch(() => ({}));
      setNotas(Array.isArray(json?.data) ? json.data : []);
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

  useEffect(() => {
    (async () => {
      try {
        const data = await Entrenamientos.listarTodos();
        setEntrenamientos((data?.data || [])
          .filter((ent) => String(ent?.deportista?.dni) === String(usuario?.dni))
          .map((ent) => ({ ...ent, ejercicios: ent.ejercicios || [] })));
      } catch (error) {
        console.error(error);
        setEntrenamientos([]);
      }
    })();
  }, [usuario?.dni]);

  const actualizarPeso = async () => {
    let inputPeso = prompt("Ingresa tu nuevo peso (kg). Puedes usar decimales:", usuario?.peso ?? "");
    if (!inputPeso) return;

    const nuevoPeso = inputPeso.replace(',', '.').trim();

    if (isNaN(parseFloat(nuevoPeso))) {
      alert("Por favor, ingresa un número válido.");
      return;
    }

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
        alert("Peso actualizado correctamente");

        const actualizado = { ...usuario, peso: parseFloat(nuevoPeso) };
        localStorage.setItem("usuario", JSON.stringify(actualizado));
        setUsuario(actualizado);
      } else {
        alert(data.mensaje || "Error al actualizar el peso");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
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
    if (!usuario?.dni) {
      alert("No se encontró información del usuario");
      return;
    }

    const contrasena = prompt("Ingresa tu contraseña para confirmar la baja de tu cuenta:");
    if (!contrasena) return;

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
        alert("Cuenta eliminada correctamente");
        localStorage.removeItem("usuario");
        localStorage.removeItem("historialPesos");
        onLogout();
      } else {
        const err = await deleteRes.json();
        alert(err.mensaje || "Error eliminando la cuenta");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión con el servidor");
    }
  };

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

      <button type="button" className="btn btn-outline" onClick={darBajaCuenta}>
        Dar de baja la cuenta
      </button>
    </section>
  );
}

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
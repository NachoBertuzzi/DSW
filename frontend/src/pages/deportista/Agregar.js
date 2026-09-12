import React, { useState, useMemo, useEffect } from 'react';
import Back from '../../components/Back';
import { Entrenamientos, API_URL } from '../../services/api';
import '../styles/MenuDeportista.css';

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
  const [guardandoEntrenamiento, setGuardandoEntrenamiento] = useState(false);
  const [mensajeEntrenamiento, setMensajeEntrenamiento] = useState('');

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
    if (guardandoEntrenamiento) return;
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

    setMensajeEntrenamiento('');
    setGuardandoEntrenamiento(true);
    try {
      await Entrenamientos.crear(payload);
    } catch (e) {
      console.error(e);
      setMensajeEntrenamiento('No se pudo guardar el entrenamiento.');
      setGuardandoEntrenamiento(false);
      return;
    }

    setGuardandoEntrenamiento(false);
    setMensajeEntrenamiento('Entrenamiento guardado correctamente.');
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
    if (guardandoEntrenamiento) return;
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

    setMensajeEntrenamiento('');
    setGuardandoEntrenamiento(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      if (asigActiva?.entrenamiento?.id) {
        const response = await fetch(`${API_URL}/entrenamientos/${asigActiva.entrenamiento.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ ejercicios: item.ejercicios, estado: 'completado' }),
        });
        if (!response.ok) throw new Error('No se pudo actualizar el entrenamiento.');
      }
      const response = await fetch(`${API_URL}/asignaciones-entrenamientos/${asigActiva.id}/estado`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ estado: 'completado' }),
      });
      if (!response.ok) throw new Error('No se pudo actualizar la asignación.');
    } catch (error) {
      setGuardandoEntrenamiento(false);
      setMensajeEntrenamiento(error.message || 'No se pudo guardar el entrenamiento.');
      return;
    }

    setGuardandoEntrenamiento(false);
    setMensajeEntrenamiento('Entrenamiento asignado registrado correctamente.');
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
                <button className="btn btn-primary" disabled={ejercicios.length === 0 || guardandoEntrenamiento} onClick={terminarPropio}>
                  {guardandoEntrenamiento ? 'Guardando...' : 'Terminar entrenamiento'}
                </button>
                <button className="btn btn-outline" onClick={() => setEnCursoPropio(false)}>Cancelar</button>
              </div>
              {mensajeEntrenamiento && <p className="muted" role="status">{mensajeEntrenamiento}</p>}
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
                <button className="btn btn-primary" disabled={guardandoEntrenamiento} onClick={terminarAsignado}>
                  {guardandoEntrenamiento ? 'Guardando...' : 'Terminar entrenamiento'}
                </button>
                {mensajeEntrenamiento && <p className="muted" role="status">{mensajeEntrenamiento}</p>}
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


export default Agregar;
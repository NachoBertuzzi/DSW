import React, { useState, useMemo, useEffect } from 'react';
import Back from '../../components/Back';
import { Entrenamientos } from '../../services/api';
import '../styles/MenuDeportista.css';

function Historial({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [q, setQ] = useState('');
  const [borrandoId, setBorrandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editFecha, setEditFecha] = useState('');
  const [editHora, setEditHora] = useState('');
  const [editEjercicios, setEditEjercicios] = useState([]);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErrorCarga('');
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
        setErrorCarga('No se pudo cargar el historial de entrenamientos.');
      } finally {
        setLoading(false);
      }
    })();
  }, [usuario?.dni]);

  const borrar = async (it) => {
    if (!window.confirm('¿Eliminar este entrenamiento del historial?')) return;
    if (borrandoId) return;
    setMensaje('');
    setBorrandoId(it.idLocal);
    try {
      await Entrenamientos.eliminar(it.backendId || it.id);
      setItems(actuales => actuales.filter(x => x.idLocal !== it.idLocal));
      setMensaje('Entrenamiento eliminado correctamente.');
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo eliminar el entrenamiento.');
    } finally {
      setBorrandoId(null);
    }
  };

  const iniciarEdicion = (it) => {
    setEditandoId(it.idLocal);
    setEditFecha(it.fechaEntrenamiento || '');
    setEditHora(it.horaEntrenamiento || '');
    setEditEjercicios((it.ejercicios || []).map((ejercicio) => ({
      ...ejercicio,
      series: (ejercicio.series || []).map((serie) => ({ ...serie })),
    })));
    setMensaje('');
  };

  const cambiarEjercicio = (index, campo, valor) => {
    setEditEjercicios((prev) => prev.map((ejercicio, i) =>
      i === index ? { ...ejercicio, [campo]: valor } : ejercicio
    ));
  };

  const cambiarSerie = (ejercicioIndex, serieIndex, campo, valor) => {
    setEditEjercicios((prev) => prev.map((ejercicio, i) => {
      if (i !== ejercicioIndex) return ejercicio;
      return {
        ...ejercicio,
        series: (ejercicio.series || []).map((serie, j) =>
          j === serieIndex ? { ...serie, [campo]: valor } : serie
        ),
      };
    }));
  };

  const agregarSerie = (ejercicioIndex) => {
    setEditEjercicios((prev) => prev.map((ejercicio, i) =>
      i === ejercicioIndex
        ? { ...ejercicio, series: [...(ejercicio.series || []), { peso: '', reps: '' }] }
        : ejercicio
    ));
  };

  const quitarSerie = (ejercicioIndex, serieIndex) => {
    setEditEjercicios((prev) => prev.map((ejercicio, i) =>
      i === ejercicioIndex
        ? { ...ejercicio, series: (ejercicio.series || []).filter((_, j) => j !== serieIndex) }
        : ejercicio
    ));
  };

  const guardarEdicion = async (it) => {
    if (guardandoEdicion || !editFecha) return;
    setGuardandoEdicion(true);
    setMensaje('');
    try {
      const actualizado = await Entrenamientos.actualizar(it.backendId || it.id, {
        fechaEntrenamiento: editFecha,
        horaEntrenamiento: editHora || undefined,
        ejercicios: editEjercicios,
      });
      const nuevo = actualizado?.data || { ...it, fechaEntrenamiento: editFecha, horaEntrenamiento: editHora };
      setItems((actuales) => actuales.map((item) => item.idLocal === it.idLocal
        ? { ...item, ...nuevo, idLocal: it.idLocal, backendId: it.backendId || it.id }
        : item));
      setEditandoId(null);
      setMensaje('Entrenamiento actualizado correctamente.');
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo actualizar el entrenamiento.');
    } finally {
      setGuardandoEdicion(false);
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
        errorCarga ? <p className="error-message" role="alert">{errorCarga}</p> :
        filtrados.length === 0 ? <p className="muted">No hay entrenamientos guardados.</p> :
          <ul className="list">
            {filtrados.map(it => (
              <li key={it.idLocal} className="item">
                <div className="item-head">
                  <div>
                      {editandoId === it.idLocal ? (
                        <div>
                          <div className="row gap">
                            <input className="input" type="date" value={editFecha} onChange={(event) => setEditFecha(event.target.value)} aria-label="Fecha del entrenamiento" />
                            <input className="input" type="time" value={editHora} onChange={(event) => setEditHora(event.target.value)} aria-label="Hora del entrenamiento" />
                          </div>
                          {editEjercicios.map((ejercicio, ejercicioIndex) => (
                            <div key={ejercicio.id || ejercicioIndex} className="card-box" style={{ marginTop: 8 }}>
                              <input
                                className="input"
                                type="text"
                                value={ejercicio.nombre || ''}
                                onChange={(event) => cambiarEjercicio(ejercicioIndex, 'nombre', event.target.value)}
                                placeholder="Ejercicio"
                                aria-label={`Ejercicio ${ejercicioIndex + 1}`}
                              />
                              <small className="muted">Series: {ejercicio.series?.length || 0}</small>
                              {(ejercicio.series || []).map((serie, serieIndex) => (
                                <div key={serieIndex} className="row gap" style={{ marginTop: 6 }}>
                                  <input
                                    className="input"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={serie.peso ?? ''}
                                    onChange={(event) => cambiarSerie(ejercicioIndex, serieIndex, 'peso', event.target.value)}
                                    placeholder="Peso (kg)"
                                    aria-label={`Peso serie ${serieIndex + 1}`}
                                  />
                                  <input
                                    className="input"
                                    type="number"
                                    min="1"
                                    value={serie.reps ?? ''}
                                    onChange={(event) => cambiarSerie(ejercicioIndex, serieIndex, 'reps', event.target.value)}
                                    placeholder="Repeticiones"
                                    aria-label={`Repeticiones serie ${serieIndex + 1}`}
                                  />
                                  <button type="button" className="btn btn-outline" onClick={() => quitarSerie(ejercicioIndex, serieIndex)}>
                                    Quitar serie
                                  </button>
                                </div>
                              ))}
                              <button type="button" className="btn btn-outline" style={{ marginTop: 6 }} onClick={() => agregarSerie(ejercicioIndex)}>
                                Agregar serie
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <strong>{it.fechaEntrenamiento} {it.horaEntrenamiento || ''}</strong>
                      )}
                      <br />
                    {it.entrenadorNombre && <small className="muted">Entrenador: {it.entrenadorNombre}</small>}
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                      {!it.entrenador?.dni && (editandoId === it.idLocal ? (
                        <>
                          <button className="btn btn-primary" disabled={guardandoEdicion} onClick={() => guardarEdicion(it)}>
                            {guardandoEdicion ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button className="btn btn-outline" disabled={guardandoEdicion} onClick={() => setEditandoId(null)}>Cancelar</button>
                        </>
                      ) : (
                        <button className="btn btn-outline" onClick={() => iniciarEdicion(it)}>Editar</button>
                      ))}
                      <button className="btn btn-outline" disabled={borrandoId === it.idLocal} onClick={() => borrar(it)}>
                        {borrandoId === it.idLocal ? 'Borrando...' : 'Borrar'}
                      </button>
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
          {mensaje && <p className="muted" role="status">{mensaje}</p>}
    </section>
  );
}


export default Historial;
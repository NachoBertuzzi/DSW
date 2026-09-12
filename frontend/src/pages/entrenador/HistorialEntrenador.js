import React, { useState, useEffect } from 'react';
import { Entrenamientos, FallbackCoach, API_URL } from '../../services/api';
import { Back } from '../../components/MenuComponents';
import '../styles/MenuEntrenador.css';

function HistorialEntrenador({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [items, setItems] = useState([]);
  const [deportistaFiltro, setDeportistaFiltro] = useState('');
  const [detalleId, setDetalleId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [asignacionesRes, entrenamientosRes] = await Promise.all([
          fetch(`${API_URL}/asignaciones-entrenamientos/entrenadores/${coach.dni}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          Entrenamientos.listarTodos(),
        ]);
        const asignacionesJson = await asignacionesRes.json().catch(() => ({}));
        const asignaciones = Array.isArray(asignacionesJson?.data) ? asignacionesJson.data : [];
        const entrenamientosJson = entrenamientosRes?.data;
        const entrenamientos = Array.isArray(entrenamientosJson) ? entrenamientosJson : [];
        const deportistas = FallbackCoach.getLista(coach.dni) || [];
        const deportistaDnis = new Set([
          ...deportistas.map(d => d?.dni).filter(Boolean).map(String),
          ...asignaciones.map(a => a?.deportista?.dni).filter(Boolean).map(String),
        ]);
        const detallesLocales = new Map();
        const detallesLocalesPorFecha = new Map();
        [...deportistaDnis].forEach(dni => {
          const historial = JSON.parse(localStorage.getItem(`athlete:${dni}:historial`) || '[]');
          historial.forEach(detalle => {
            if (detalle?.backendId !== null && detalle?.backendId !== undefined) {
              detallesLocales.set(String(detalle.backendId), detalle);
            }
            const fecha = String(detalle?.fechaEntrenamiento || '').slice(0, 10);
            const hora = detalle?.horaEntrenamiento || '';
            if (fecha) detallesLocalesPorFecha.set(`${dni}|${fecha}|${hora}`, detalle);
          });
        });
        const asignacionPorEntrenamiento = new Map(
          asignaciones
            .filter(a => a?.entrenamiento?.id !== undefined)
            .map(a => [String(a.entrenamiento.id), a])
        );

        const propiosOAsignados = entrenamientos
          .filter(ent => deportistaDnis.has(String(ent?.deportista?.dni)))
          .map(ent => {
            const asignacion = asignacionPorEntrenamiento.get(String(ent.id));
            const fecha = String(ent?.fechaEntrenamiento || '').slice(0, 10);
            const hora = ent?.horaEntrenamiento || '';
            const detalle = detallesLocales.get(String(ent.id)) ||
              detallesLocalesPorFecha.get(`${ent?.deportista?.dni}|${fecha}|${hora}`) ||
              (Array.isArray(ent?.ejercicios) ? { ...ent, ejercicios: ent.ejercicios } : null);
            return asignacion ? { ...asignacion, detalle } : {
              id: `entrenamiento-${ent.id}`,
              entrenamiento: ent,
              deportista: ent.deportista,
              detalle,
              estado: 'propio',
            };
          });

        const idsIncluidos = new Set(propiosOAsignados.map(item => String(item.id)));
        const asignacionesSinEntrenamiento = asignaciones.filter(item => !idsIncluidos.has(String(item.id)));
        setItems([...propiosOAsignados, ...asignacionesSinEntrenamiento]);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [coach.dni]);

  const deportistasDisponibles = [...new Map(
    (items || [])
      .filter(it => it?.deportista?.dni)
      .map(it => [String(it.deportista.dni), it.deportista])
  ).values()].sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));
  const filtrados = (items || []).filter(it =>
    deportistaFiltro ? String(it?.deportista?.dni) === deportistaFiltro : true
  );
  const formatoDuracion = (segundos) => {
    if (!Number.isFinite(Number(segundos))) return '—';
    const total = Math.max(0, Number(segundos));
    const minutos = Math.floor(total / 60);
    const restantes = total % 60;
    return `${minutos} min ${restantes} s`;
  };

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Historial de entrenamientos de tus deportistas</h3>

      <select
        className="input"
        value={deportistaFiltro}
        onChange={e => setDeportistaFiltro(e.target.value)}
      >
        <option value="">Todos los deportistas</option>
        {deportistasDisponibles.map(deportista => (
          <option key={deportista.dni} value={deportista.dni}>
            {deportista.nombre || deportista.dni}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <p className="muted">No hay entrenamientos de tus deportistas todavía.</p>
      ) : (
        <ul className="list">
          {filtrados.map(it => {
            const ejercicios = it?.detalle?.ejercicios || [];
            const abierto = detalleId === it.id;
            return (
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
                <div><small className="muted">Estado: {it?.estado === 'propio' ? 'Propio' : it?.estado}</small></div>
                <button
                  className="btn btn-outline"
                  style={{ marginTop: 8 }}
                  onClick={() => setDetalleId(abierto ? null : it.id)}
                >
                  {abierto ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
                {abierto && (
                  <div style={{ marginTop: 10 }}>
                    <small className="muted">
                      Hora: {it?.detalle?.horaEntrenamiento || it?.entrenamiento?.horaEntrenamiento || '—'}
                    </small>
                    <br />
                    <small className="muted">
                      Duración: {formatoDuracion(it?.detalle?.duracionSegundos)}
                    </small>
                    {ejercicios.length === 0 ? (
                      <p className="muted">No hay ejercicios detallados para este entrenamiento.</p>
                    ) : (
                      <ul className="list" style={{ marginTop: 8 }}>
                        {ejercicios.map((ejercicio, index) => (
                          <li key={ejercicio.id || `${it.id}-${index}`} className="item">
                            <strong>{ejercicio.nombre || 'Ejercicio'}</strong>
                            <small className="muted"> {ejercicio.grupo || ''}</small>
                            {ejercicio.series?.length ? (
                              <div className="series" style={{ marginTop: 6 }}>
                                {ejercicio.series.map((serie, serieIndex) => (
                                  <div key={serieIndex} className="series-row">
                                    <span>Serie #{serieIndex + 1}</span>
                                    <span className="muted">Peso: {serie.peso || '—'}</span>
                                    <span className="muted">Reps: {serie.reps || '—'}</span>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}



export default HistorialEntrenador;
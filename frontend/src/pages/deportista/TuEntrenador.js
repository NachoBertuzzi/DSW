import React, { useState, useMemo, useEffect } from 'react';
import { Back } from '../../components/MenuComponents';
import { FallbackCoach, API_URL } from '../../services/api';
import '../styles/MenuDeportista.css';

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
  const [accion, setAccion] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState('');

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
    if (accion) return;
    setAccion('asignar');
    setMensajeAccion('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/deportistas/${usuario?.dni}/entrenador`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entrenadorDni: ent.dni })
      });
      if (!res.ok) throw new Error('No se pudo asignar el entrenador.');
    } catch (error) {
      setMensajeAccion(error.message || 'No se pudo asignar el entrenador.');
      setAccion('');
      return;
    }

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
    setAccion('');
    setMensajeAccion('Entrenador asignado correctamente.');
  };

  const baja = async () => {
    if (!window.confirm('¿Seguro que querés dar de baja a tu entrenador?')) return;
    if (accion) return;
    setAccion('baja');
    setMensajeAccion('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/deportistas/${usuario?.dni}/entrenador`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entrenadorDni: null })
      });
      if (!res.ok) throw new Error('No se pudo desvincular el entrenador.');
    } catch (error) {
      setMensajeAccion(error.message || 'No se pudo desvincular el entrenador.');
      setAccion('');
      return;
    }

    if (coach?.dni) {
      try { FallbackCoach.quitarPorDni(coach.dni, usuario?.dni); } catch {}
    }

    localStorage.removeItem(KEY_COACH);
    setCoach(null);
    setNotas([]);
    setModo('elegir');
    setAccion('');
    setMensajeAccion('Entrenador desvinculado correctamente.');
  };

  

  const enviarNota = async () => {
    const t = nota.trim();
    if (!t) return alert('Escribí una nota');
    if (!coach?.dni || !usuario?.dni) return;
    if (accion) return;

    setAccion('nota');
    setMensajeAccion('');
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
      if (!actualizadas.ok) throw new Error('La nota se guardó, pero no se pudo actualizar la lista.');
      const json = await actualizadas.json().catch(() => ({}));
      setNotas(Array.isArray(json?.data) ? json.data : []);
      setMensajeAccion('Nota enviada correctamente a tu entrenador.');
    } catch (e) {
      console.error(e);
      setMensajeAccion(e.message || 'No se pudo guardar la nota.');
    } finally {
      setAccion('');
    }
  };

  const filtrados = lista
    .filter(e => qEsp ? String(e.especialidad || '').toLowerCase().includes(qEsp.toLowerCase()) : true)
    .sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tu entrenador</h3>
      {mensajeAccion && <p className="muted" role="status">{mensajeAccion}</p>}

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
              <button type="button" className="btn btn-primary" disabled={accion === 'nota'} onClick={enviarNota}>
                {accion === 'nota' ? 'Enviando...' : 'Enviar nota'}
              </button>
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
            <button type="button" className="btn btn-outline" disabled={accion === 'baja'} onClick={baja}>
              {accion === 'baja' ? 'Desvinculando...' : 'Dar de baja entrenador'}
            </button>
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
                    <button className="btn btn-primary" disabled={accion === 'asignar'} onClick={() => asignar(e)}>
                      {accion === 'asignar' ? 'Asignando...' : 'Elegir'}
                    </button>
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


export default TuEntrenador;
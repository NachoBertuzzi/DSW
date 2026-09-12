import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import Back from '../../components/Back';
import '../styles/MenuEntrenador.css';

function TusDeportistas({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [lista, setLista] = useState([]);
  const [q, setQ] = useState('');
  const [notasPorDni, setNotasPorDni] = useState({});
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [bajandoId, setBajandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setErrorCarga('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entrenadores/${coach.dni}/deportistas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la lista de deportistas.');
      const json = await res.json().catch(() => ({}));
      setLista(Array.isArray(json?.data) ? json.data : []);
    } catch (error) {
      console.error(error);
      setLista([]);
      setErrorCarga('No se pudo cargar la lista de deportistas.');
    } finally {
      setCargando(false);
    }
  }, [coach.dni]);
  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    (async () => {
      try {
        setErrorCarga('');
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/notas/entrenadores/${coach.dni}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('No se pudieron cargar las notas de los deportistas.');
        const json = await res.json().catch(() => ({}));
        const agrupadas = {};
        (json?.data || []).forEach((nota) => {
          const dni = String(nota?.deportista?.dni || '');
          if (dni && !agrupadas[dni]) agrupadas[dni] = nota;
        });
        setNotasPorDni(agrupadas);
      } catch (error) {
        console.error(error);
        setErrorCarga('No se pudieron cargar las notas de los deportistas.');
      }
    })();
  }, [coach.dni]);

  const fmt = (iso) => {
    try { const d = new Date(iso); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0,5); }
    catch { return ''; }
  };

  const baja = async (id) => {
    if (!window.confirm('¿Dar de baja a este deportista?')) return;
    if (bajandoId) return;

    const dep = (lista || []).find(d => String(d.id) === String(id) || String(d.dni) === String(id));
    setBajandoId(id);
    setMensaje('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/deportistas/${dep?.dni || id}/entrenador`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entrenadorDni: null }),
      });
      if (!res.ok) throw new Error('No se pudo desvincular al deportista.');
      setMensaje('Deportista desvinculado correctamente.');
    } catch (error) {
      console.error(error);
      setMensaje(error.message || 'No se pudo desvincular al deportista.');
      return;
    } finally {
      setBajandoId(null);
    }
    cargar();
  };

  const visibles = (lista || [])
    .filter(d => {
      if (!q) return true;
      const hay = `${d?.nombre || ''} ${d?.apellido || ''} ${d?.username || d?.usuario || ''}`
        .toLowerCase()
        .includes(q.toLowerCase());
      return hay;
    })
    .sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Tus deportistas</h3>
      {errorCarga && (
        <p className="error-message" role="alert">
          {errorCarga}
        </p>
      )}

      <div className="row gap wrap" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Buscar (nombre o @username)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>

      {cargando ? (
        <p className="muted">Cargando deportistas...</p>
      ) : visibles.length === 0 ? (
        <p className="muted">No hay deportistas para mostrar.</p>
      ) : (
        <ul className="list">
          {visibles.map(d => {
            const ultima = notasPorDni[String(d.dni || d.id)];
            return (
              <li key={d.dni || d.id} className="item">
                <div>
                  <strong>{d.nombre || d.username}</strong>
                  {d.username && <div><small className="muted">@{d.username}</small></div>}
                  {ultima && (
                    <div style={{marginTop: 4}}>
                      <small className="muted">Última nota ({fmt(ultima.fecha)}):</small>
                      <div>{ultima.texto}</div>
                    </div>
                  )}
                </div>
                <button className="btn btn-outline" disabled={bajandoId === (d.dni || d.id)} onClick={() => baja(d.dni || d.id)}>
                  {bajandoId === (d.dni || d.id) ? 'Desvinculando...' : 'Dar de baja'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {mensaje && <p className="muted" role="status">{mensaje}</p>}
    </section>
  );
}


export default TusDeportistas;
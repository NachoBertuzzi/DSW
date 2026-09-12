import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import Back from '../../components/Back';
import '../styles/MenuEntrenador.css';

export function AsignarEntrenamiento({ onVolver }) {
  const coach = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [lista, setLista] = useState([]);
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState(''); 
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState('');   
  const [ejercicios, setEjercicios] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(true);

  const GRUPOS_EJERCICIOS = {
    Pecho: ["Press de banca","Press inclinado","Aperturas con mancuernas","Fondos","Pullover","Pec deck","Press declinado","Flexiones","Press máquina","Cruce de cables"],
    Espalda: ["Dominadas","Remo barra","Remo mancuerna","Peso muerto","Jalón al pecho","Pull-over polea","Remo máquina","Hiperextensiones","Encogimientos","Remo al mentón"],
    Hombros: ["Press militar","Elevaciones laterales","Elevaciones frontales","Elevaciones posteriores","Press Arnold","Face pull","Remo al mentón","Encogimiento hombros","Elevación máquina","Pájaros"],
    Bíceps: ["Curl barra","Curl mancuernas","Curl martillo","Curl concentrado","Curl predicador","Curl polea","Curl inverso","Curl alternado","Curl 21s","Zottman"],
    Tríceps: ["Fondos","Press francés","Extensión polea","Patada tríceps","Press cerrado","Skull crusher","Extensión mancuerna","Dips banco","Extensión máquina","Press polea"],
    Piernas: ["Sentadilla barra","Sentadilla frontal","Prensa","Zancadas","Peso muerto rumano","Extensión piernas","Curl piernas","Elevación talones","Hip thrust","Step-ups"],
    Abdominales: ["Crunch","Elevación piernas","Plancha","Plancha lateral","Crunch polea","Ab wheel","Elevación rodillas","Crunch oblicuo","Mountain climbers","Russian twists"]
  };

  const cargar = useCallback(async () => {
    setCargandoLista(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entrenadores/${coach.dni}/deportistas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      setLista(Array.isArray(json?.data) ? json.data : []);
    } catch (error) {
      console.error(error);
      setLista([]);
    } finally {
      setCargandoLista(false);
    }
  }, [coach.dni]);
  useEffect(() => { cargar(); }, [cargar]);

  const refrescarLista = () => cargar();

  const visibles = (lista || [])
    .filter(d => {
      if (!q) return true;
      const hay = `${d?.nombre || ''} ${d?.apellido || ''} ${d?.username || d?.usuario || ''}`
        .toLowerCase()
        .includes(q.toLowerCase());
      return hay;
    })
    .sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));

  const ejerciciosDelGrupo = grupo ? GRUPOS_EJERCICIOS[grupo] : [];

  const agregarEj = () => {
    if (!grupo) return alert('Seleccioná un grupo muscular');
    if (!nombre) return alert('Seleccioná un ejercicio');
    setEjercicios(p => [...p, { id: crypto.randomUUID(), nombre, grupo }]);
    setNombre('');
  };

  const eliminarEj = (id) => setEjercicios(p => p.filter(e => e.id !== id));

  const terminar = async () => {
    if (!selId) return alert('Elegí un deportista');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');
    if (!coach?.dni) return alert('No se encontró tu DNI de entrenador en la sesión');

    const seleccionado = lista.find(d => String(d.dni || d.id) === String(selId));
    const deportistaDni = seleccionado?.dni || seleccionado?.id || selId || null;

    if (!deportistaDni) return alert('No encuentro el DNI/ID del deportista seleccionado.');

    const token = localStorage.getItem('token');

    try {
      setEnviando(true);

      const r1 = await fetch(`${API_URL}/entrenamientos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          fechaEntrenamiento: fecha,
          ...(hora ? { horaEntrenamiento: hora } : {}),
          deportista: { dni: String(deportistaDni) },
        }),
      });
      if (!r1.ok) {
        const txt = await r1.text().catch(() => '');
        throw new Error(`No se pudo crear el entrenamiento. ${txt}`);
      }
      const data1 = await r1.json().catch(() => ({}));
      const entrenamientoId = data1?.data?.id ?? data1?.id; 
      if (!entrenamientoId) {
        throw new Error('El backend no devolvió id del entrenamiento.');
      }

      const r2 = await fetch(`${API_URL}/asignaciones-entrenamientos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          entrenadorDni: String(coach.dni),
          deportistaDni: String(deportistaDni),
          entrenamientoId: Number(entrenamientoId),
          fecha, 
          notas: ejercicios.map(e => `${e.grupo}: ${e.nombre}`).join(' | ') || undefined, 
        }),
      });
      if (!r2.ok) {
        const txt = await r2.text().catch(() => '');
        throw new Error(`No se pudo crear la asignación. ${txt}`);
      }

      alert('Entrenamiento asignado con éxito');
      onVolver();
    } catch (e) {
      console.error(e);
      alert(e.message || 'No se pudo guardar en el backend');
    } finally {
      setEnviando(false);
    }
  };


  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Asignar entrenamiento</h3>

      <div className="row gap wrap">
        <input
          className="input"
          placeholder="Buscar deportista (nombre o @username)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <button className="btn btn-outline" disabled={cargandoLista} onClick={refrescarLista}>
          {cargandoLista ? 'Cargando...' : 'Actualizar lista'}
        </button>
      </div>

      <div className="row gap wrap">
        <select className="input" value={selId} onChange={e => setSelId(e.target.value)} disabled={cargandoLista}>
          <option value="">— Elegí un deportista —</option>
          {visibles.map(d => (
            <option key={d.dni || d.id} value={d.dni || d.id}>
              {d.nombre || d.username || d.dni || d.id}
            </option>
          ))}
        </select>
      </div>

      <div className="row gap wrap">
        <div>
          <label className="muted" style={{ display: 'block', marginBottom: 4 }}>Fecha</label>
          <input className="input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div>
          <label className="muted" style={{ display: 'block', marginBottom: 4 }}>Hora (opcional)</label>
          <input className="input" type="time" value={hora} onChange={e => setHora(e.target.value)} placeholder="hh:mm" />
        </div>
      </div>

      <div className="row gap wrap">
        <select className="input" value={grupo} onChange={e => { setGrupo(e.target.value); setNombre(''); }}>
          <option value="">— Seleccioná grupo muscular —</option>
          {Object.keys(GRUPOS_EJERCICIOS).map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select className="input" value={nombre} onChange={e => setNombre(e.target.value)} disabled={!grupo}>
          <option value="">— Seleccioná ejercicio —</option>
          {(ejerciciosDelGrupo).map(ej => <option key={ej} value={ej}>{ej}</option>)}
        </select>

        <button className="btn btn-primary" onClick={agregarEj} disabled={!nombre}>Agregar</button>
      </div>

      <ul className="list">
        {ejercicios.map(e => (
          <li key={e.id} className="item">
            <div className="item-head">
              <div><strong>{e.nombre}</strong> <small className="muted">{e.grupo}</small></div>
              <button className="icon" onClick={() => eliminarEj(e.id)}>✕</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="row gap">
        <button
          className="btn btn-primary"
          disabled={!selId || ejercicios.length === 0 || enviando}
          onClick={terminar}
        >
          {enviando ? 'Guardando…' : 'Terminar'}
        </button>
        <button className="btn btn-outline" disabled={enviando} onClick={onVolver}>Cancelar</button>
      </div>
    </section>
  );
}



export default AsignarEntrenamiento;
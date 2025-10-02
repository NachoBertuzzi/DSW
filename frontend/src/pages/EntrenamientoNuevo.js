import React, { useMemo, useState } from 'react';
import { Entrenamientos } from '../services/api';

export default function EntrenamientoNuevo({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');

  const agregar = () => {
    if (!nombre.trim()) return;
    setEjercicios((p) => [...p, { id: crypto.randomUUID(), nombre: nombre.trim(), grupo: grupo.trim() }]);
    setNombre(''); setGrupo('');
  };
  const eliminar = (id) => setEjercicios((p) => p.filter((e) => e.id !== id));

  const terminar = async () => {
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');

    // Tu backend espera: fechaEntrenamiento, horaEntrenamiento y puede recibir deportista (dni).
    // Como es "propio", NO mandamos entrenador.
    const payload = {
      fechaEntrenamiento: fecha,      // 'YYYY-MM-DD'
      horaEntrenamiento: hora,        // 'HH:mm'
      deportista: usuario?.dni,       // referencia por DNI (tu servicio lo soporta)
      // Si querés guardar detalle de ejercicios, tendrás que extender tu entidad; por ahora mandamos básico.
    };

    try {
      await Entrenamientos.crear(payload);
      alert('Entrenamiento guardado');
      onVolver();
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar en el backend');
    }
  };

  return (
    <section>
      <button onClick={onVolver} style={{ marginBottom: 10 }}>← Volver</button>
      <h3>Agregar entrenamiento</h3>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'8px 0' }}>
        <input type="date" value={fecha} onChange={(e)=>setFecha(e.target.value)} />
        <input type="time" value={hora} onChange={(e)=>setHora(e.target.value)} />
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'8px 0' }}>
        <input placeholder="Nombre ejercicio" value={nombre} onChange={e=>setNombre(e.target.value)} />
        <input placeholder="Grupo muscular" value={grupo} onChange={e=>setGrupo(e.target.value)} />
        <button onClick={agregar}>Agregar</button>
      </div>

      <ul style={{ listStyle:'none', padding:0 }}>
        {ejercicios.map(e => (
          <li key={e.id} style={{ display:'flex', justifyContent:'space-between', border:'1px solid #eee', padding:8, borderRadius:8, marginBottom:6 }}>
            <div><strong>{e.nombre}</strong> <small style={{opacity:.7}}>{e.grupo}</small></div>
            <button onClick={()=>eliminar(e.id)}>✕</button>
          </li>
        ))}
      </ul>

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={terminar}>Terminar</button>
        <button onClick={onVolver}>Cancelar</button>
      </div>
    </section>
  );
}
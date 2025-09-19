// src/pages/MenuDeportista.js
import React, { useState, useMemo } from 'react';

function MenuDeportista({ onLogout }) {
  const [vista, setVista] = useState('home'); // home | agregar | historial | entrenador | perfil
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
  }, []);

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h2 style={{ margin: 0 }}>Menú del Deportista</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <small>{usuario?.nombre ? `Hola, ${usuario.nombre}` : ''}</small>
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      {vista === 'home' && (
        <div style={styles.grid}>
          <Card title="1) Agregar entrenamiento" onClick={() => setVista('agregar')}
                desc="Crear entrenamiento (propio o asignado)" />
          <Card title="2) Historial de entrenamientos" onClick={() => setVista('historial')}
                desc="Ver entrenamientos anteriores" />
          <Card title="3) Tu entrenador" onClick={() => setVista('entrenador')}
                desc="Ver/Agregar/Cambiar entrenador" />
          <Card title="4) Tu perfil" onClick={() => setVista('perfil')}
                desc="Datos de tu cuenta" />
        </div>
      )}

      {vista === 'agregar' && <AgregarEntrenamiento onVolver={() => setVista('home')} />}

      {vista === 'historial' && <Historial onVolver={() => setVista('home')} />}

      {vista === 'entrenador' && <TuEntrenador onVolver={() => setVista('home')} />}

      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} />}
    </div>
  );
}

/* ------- Subvistas ------- */

function AgregarEntrenamiento({ onVolver }) {
  const [modo, setModo] = useState(null); // 'propio' | 'asignado'
  // Estado mínimo para flujo "propio"
  const [ejercicios, setEjercicios] = useState([]); // [{id, nombre, grupo, series: [{peso, reps}]}]
  const [nombreEjercicio, setNombreEjercicio] = useState('');
  const [grupo, setGrupo] = useState('');
  const [cantSeries, setCantSeries] = useState(1);

  const agregarEjercicio = () => {
    if (!nombreEjercicio.trim()) return;
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: nombreEjercicio.trim(),
      grupo: grupo.trim(),
      series: Array.from({ length: Number(cantSeries) || 1 }, () => ({ peso: '', reps: '' })),
    };
    setEjercicios((prev) => [...prev, nuevo]);
    setNombreEjercicio('');
    setGrupo('');
    setCantSeries(1);
  };

  const setSerieValor = (idEj, idxSerie, campo, valor) => {
    setEjercicios((prev) =>
      prev.map((e) =>
        e.id !== idEj ? e : {
          ...e,
          series: e.series.map((s, i) => (i === idxSerie ? { ...s, [campo]: valor } : s)),
        }
      )
    );
  };

  const eliminarEjercicio = (idEj) => setEjercicios((prev) => prev.filter((e) => e.id !== idEj));

  const terminar = () => {
    // TODO: POST al backend: crear entrenamiento con fecha/hora + ejercicios
    console.log('Terminar entrenamiento (payload):', {
      fechaHora: new Date().toISOString(),
      ejercicios,
      origen: modo === 'propio' ? 'propio' : 'asignado',
    });
    alert('Entrenamiento guardado (simulado)');
    onVolver();
  };

  const cancelar = () => {
  if (window.confirm('¿Cancelar entrenamiento? Se perderán los cambios.')) onVolver();
};

  return (
    <section>
      <Back onClick={onVolver} />
      <h3>Agregar entrenamiento</h3>

      {!modo && (
        <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
          <button onClick={() => setModo('propio')}>Opción 1: Propio</button>
          <button onClick={() => setModo('asignado')}>Opción 2: Asignado</button>
        </div>
      )}

      {modo === 'propio' && (
        <>
          <p>Creá tu propio entrenamiento. Primero agregá ejercicios; luego completá series.</p>

          <div style={styles.formRow}>
            <input
              placeholder="Nombre del ejercicio (filtro por nombre)"
              value={nombreEjercicio}
              onChange={(e) => setNombreEjercicio(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Grupo muscular (piernas, espalda, etc.)"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              min={1}
              placeholder="Cant. series"
              value={cantSeries}
              onChange={(e) => setCantSeries(e.target.value)}
              style={{ ...styles.input, width: 120 }}
            />
            <button onClick={agregarEjercicio}>Agregar ejercicio</button>
          </div>

          {ejercicios.length === 0 && (
            <p style={{ opacity: 0.8 }}>Lista de ejercicios (vacía). Agregá el primero.</p>
          )}

          <ul style={styles.list}>
            {ejercicios.map((e) => (
              <li key={e.id} style={styles.listItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong>{e.nombre}</strong>
                  <button onClick={() => eliminarEjercicio(e.id)} title="Eliminar">✕</button>
                </div>
                <small style={{ opacity: 0.8 }}>{e.grupo}</small>

                <div style={{ marginTop: 8 }}>
                  {e.series.map((s, i) => (
                    <div key={i} style={styles.seriesRow}>
                      <span>Serie #{i + 1}</span>
                      <input
                        type="number"
                        placeholder="Peso"
                        value={s.peso}
                        onChange={(ev) => setSerieValor(e.id, i, 'peso', ev.target.value)}
                        style={{ ...styles.input, width: 100 }}
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={s.reps}
                        onChange={(ev) => setSerieValor(e.id, i, 'reps', ev.target.value)}
                        style={{ ...styles.input, width: 100 }}
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={terminar} disabled={ejercicios.length === 0}>Terminar entrenamiento</button>
            <button onClick={cancelar}>Cancelar</button>
          </div>
        </>
      )}

      {modo === 'asignado' && (
        <>
          <p>Entrenamiento asignado por tu entrenador.</p>
          <div style={styles.placeholder}>
            (Acá mostrás la lista de ejercicios ya cargados por el entrenador)
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={() => alert('Guardar progreso (simulado)')}>Terminar entrenamiento</button>
            <button onClick={cancelar}>Cancelar</button>
          </div>
        </>
      )}
    </section>
  );
}

function Historial({ onVolver }) {
  return (
    <section>
      <Back onClick={onVolver} />
      <h3>Historial de entrenamientos</h3>
      <div style={styles.placeholder}>
        (Listado de entrenamientos con fecha y acceso al detalle)
      </div>
    </section>
  );
}

function TuEntrenador({ onVolver }) {
  // Simulamos si tiene entrenador (en real, traés del backend o localStorage)
  const [tiene, setTiene] = useState(false);

  return (
    <section>
      <Back onClick={onVolver} />
      <h3>Tu entrenador</h3>

      {!tiene && (
        <>
          <p>No tenés entrenador asignado.</p>
          <button onClick={() => alert('Abrir listado de entrenadores (simulado)')}>
            Agregar entrenador
          </button>
        </>
      )}

      {tiene && (
        <>
          <div style={styles.cardBox}>
            <strong>Entrenador/a: </strong>Nombre Apellido
            <br />
            <small>Rating: 4.6/5</small>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => alert('Dar feedback (1-5) (simulado)')}>Dar feedback</button>
            <button onClick={() => alert('Cambiar entrenador (simulado)')}>Cambiar</button>
            <button onClick={() => setTiene(false)}>Dar de baja</button>
          </div>
        </>
      )}
    </section>
  );
}

function Perfil({ onVolver }) {
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) ?? {}; } catch { return {}; }
  }, []);

  return (
    <section>
      <Back onClick={onVolver} />
      <h3>Tu perfil</h3>
      <div style={styles.cardBox}>
        <p><strong>Nombre:</strong> {usuario?.nombre ?? '-'}</p>
        <p><strong>Email:</strong> {usuario?.email ?? '-'}</p>
      </div>
      <button onClick={() => alert('Dar de baja cuenta (simulado)')}>
        Dar de baja la cuenta
      </button>
    </section>
  );
}

/* ------- UI helpers ------- */

function Card({ title, desc, onClick }) {
  return (
    <button onClick={onClick} style={styles.card}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ opacity: 0.8, marginTop: 4 }}>{desc}</div>
      </div>
    </button>
  );
}

function Back({ onClick }) {
  return (
    <button onClick={onClick} style={{ marginBottom: 10 }}>{'← Volver'}</button>
  );
}

/* ------- estilos mínimos ------- */
const styles = {
  wrap: { maxWidth: 900, margin: '0 auto', padding: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 },
  card: {
    width: '100%', padding: 16, border: '1px solid #ddd', borderRadius: 12, cursor: 'pointer',
    background: 'white', textAlign: 'left'
  },
  cardBox: { border: '1px solid #eee', borderRadius: 8, padding: 12, background: '#fafafa' },
  formRow: { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' },
  input: { padding: 8, borderRadius: 6, border: '1px solid #ddd' },
  list: { listStyle: 'none', padding: 0, marginTop: 8 },
  listItem: { border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8, background: '#fff' },
  seriesRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 },
  placeholder: { border: '1px dashed #bbb', padding: 16, borderRadius: 8, background: '#fcfcfc' },
};

export default MenuDeportista;

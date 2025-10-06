import React, { useState, useMemo, useEffect } from 'react';
import SuccessCreated from './SuccessCreated';
import { Entrenamientos, FallbackCoach, API_URL } from '../services/api';
import './styles/MenuDeportista.css';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

function MenuDeportista({ onLogout }) {
  const [vista, setVista] = useState('home'); // home | agregar | historial | entrenador | perfil
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
        <div className="dropdown-header">
          <button type="button" className="hamburger-header">&#9776;</button>
          <div className="dropdown-content-header">
            <button type="button" className="btn" onClick={() => setVista('perfil')}>Ver mi perfil</button>
            <button type="button" className="btn btn-outline" onClick={onLogout}>Cerrar sesión</button>
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
      {vista === 'perfil' && <Perfil onVolver={() => setVista('home')} />}
    </div>
  );
}

/* ---------- Subvistas ---------- */

function Agregar({ onVolver }) {
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);
  const [modo, setModo] = useState('propio'); // propio | asignado
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0,10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0,5));

  // builder propio
  const [query, setQuery] = useState('');
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [cantSeries, setCantSeries] = useState(1);
  const [enviando, setEnviando] = useState(false);

  // asignado (placeholder)
  const [asignados, setAsignados] = useState([]);
  useEffect(() => {
    if (modo === 'asignado') {
      const key = `assigned:${usuario?.dni}`;
      setAsignados(JSON.parse(localStorage.getItem(key) || '[]'));
    }
  }, [modo, usuario?.dni]);

  const agregarEjercicio = () => {
    const n = nombre.trim();
    const g = grupo.trim();
    const series = Math.max(1, Number(cantSeries) || 1);
    if (!n) return alert('Poné un nombre de ejercicio');
    setEjercicios(p => [
      { id: crypto.randomUUID(), nombre: n, grupo: g, series: Array.from({length: series}, () => ({peso:'', reps:''})) },
      ...p,
    ]);
    setNombre(''); setGrupo(''); setCantSeries(1);
  };

  const setSerieValor = (idEj, idx, campo, valor) => {
    setEjercicios(p => p.map(e => e.id !== idEj ? e : ({
      ...e,
      series: e.series.map((s,i) => i===idx ? {...s, [campo]: valor} : s)
    })));
  };

  const eliminarEjercicio = (id) => setEjercicios(p => p.filter(e => e.id !== id));

  const ejerciciosFiltrados = query
    ? ejercicios.filter(e => (e.nombre + ' ' + (e.grupo||'')).toLowerCase().includes(query.toLowerCase()))
    : ejercicios;

  const terminar = async () => {
    if (!fecha || !hora) return alert('Completá fecha y hora');
    if (modo === 'propio' && ejercicios.length === 0) return alert('Agregá al menos un ejercicio');

    const payload = {
      fechaEntrenamiento: fecha,
      horaEntrenamiento: hora,
      deportista: usuario?.dni,
    };

    try {
      setEnviando(true);
      if (Entrenamientos?.crear) {
        await Entrenamientos.crear(payload);
      } else {
        const res = await fetch(`${API_URL}/entrenamientos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('HTTP '+res.status);
      }

      const keyHist = `athlete:${usuario?.dni}:historial`;
      const prev = JSON.parse(localStorage.getItem(keyHist) || '[]');
      localStorage.setItem(keyHist, JSON.stringify([{ id: crypto.randomUUID(), fechaEntrenamiento: fecha, horaEntrenamiento: hora, ejercicios, origen: modo }, ...prev]));
      alert('Entrenamiento guardado');
      onVolver();
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar en el backend');
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = () => { if (window.confirm('¿Cancelar? Se perderán los cambios.')) onVolver(); };

  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Agregar entrenamiento</h3>

      <div className="row gap">
        <button type="button" className={`btn ${modo==='propio'?'btn-primary':''}`} onClick={()=>setModo('propio')}>Opción 1: Propio</button>
        <button type="button" className={`btn ${modo==='asignado'?'btn-primary':''}`} onClick={()=>setModo('asignado')}>Opción 2: Asignado</button>
      </div>

      <div className="row gap">
        <input className="input" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
        <input className="input" type="time" value={hora} onChange={e=>setHora(e.target.value)} />
      </div>

      {modo === 'propio' ? (
        <>
          <div className="row gap">
            <input className="input" placeholder="Filtrar por nombre o grupo…" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>

          <div className="row gap wrap">
            <input className="input" placeholder="Nombre del ejercicio" value={nombre} onChange={e=>setNombre(e.target.value)} />
            <input className="input" placeholder="Grupo muscular" value={grupo} onChange={e=>setGrupo(e.target.value)} />
            <input className="input small" type="number" min={1} value={cantSeries} onChange={e=>setCantSeries(e.target.value)} placeholder="Cant. series" />
            <button type="button" className="btn btn-primary" onClick={agregarEjercicio}>Agregar</button>
          </div>

          {ejercicios.length === 0 && <p className="muted">Lista de ejercicios (vacía). Agregá el primero.</p>}

          <ul className="list">
            {ejerciciosFiltrados.map(e => (
              <li key={e.id} className="item">
                <div className="item-head">
                  <strong>{e.nombre}</strong>
                  <button type="button" className="icon" title="Eliminar" onClick={()=>eliminarEjercicio(e.id)}>✕</button>
                </div>
                <small className="muted">{e.grupo || '—'}</small>
                <div className="series">
                  {e.series.map((s,i)=>(
                    <div key={i} className="series-row">
                      <span>Serie #{i+1}</span>
                      <input className="input tiny" type="number" placeholder="Peso" value={s.peso} onChange={ev=>setSerieValor(e.id,i,'peso',ev.target.value)} />
                      <input className="input tiny" type="number" placeholder="Reps" value={s.reps} onChange={ev=>setSerieValor(e.id,i,'reps',ev.target.value)} />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="row gap">
            <button type="button" className="btn btn-primary" disabled={ejercicios.length===0||enviando} onClick={terminar}>{enviando?'Guardando…':'Terminar entrenamiento'}</button>
            <button type="button" className="btn btn-outline" disabled={enviando} onClick={cancelar}>Cancelar</button>
          </div>
        </>
      ) : (
        <>
          {asignados.length === 0 ? (
            <div className="placeholder">(No hay ejercicios asignados todavía.)</div>
          ) : (
            <ul className="list">
              {asignados.map(e=>(
                <li key={e.id} className="item"><strong>{e.nombre}</strong> <small className="muted">{e.grupo}</small></li>
              ))}
            </ul>
          )}
          <div className="row gap">
            <button type="button" className="btn btn-primary" disabled={enviando} onClick={terminar}>{enviando?'Guardando…':'Terminar entrenamiento'}</button>
            <button type="button" className="btn btn-outline" disabled={enviando} onClick={cancelar}>Cancelar</button>
          </div>
        </>
      )}
    </section>
  );
}

function Historial({ onVolver }) {
  return (
    <section className="panel">
      <Back onClick={onVolver} />
      <h3>Historial de entrenamientos</h3>
      <div className="placeholder">(Listado de entrenamientos con fecha y acceso al detalle)</div>
    </section>
  );
}

/* ---------- Tu Entrenador ---------- */
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
  const [modo, setModo] = useState('ver'); // ver | elegir

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

  // Si ya había vínculo previo, me aseguro de estar en la lista del coach y traigo notas
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
    alert('Feedback y puntaje: no implementado todavía (parte de AD).');
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

/* ---------- UI ---------- */
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
function Back({ onClick }) { return <button type="button" className="btn link" onClick={onClick}>← Volver</button>; }

export default MenuDeportista;

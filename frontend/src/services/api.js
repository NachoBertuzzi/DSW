const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE || // por si el Login.js usa BASE
  'http://localhost:3000/api';

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const Entrenamientos = {
  crear: (payload) => api('/entrenamientos', { method: 'POST', body: payload }),
  listarTodos: () => api('/entrenamientos'),
};

// ---------- Fallback local para UI del entrenador y "mis deportistas"
const COACHES_KEY = 'coaches:lista';
const nowISO = () => new Date().toISOString();

function seedCoachesIfEmpty() {
  const actual = JSON.parse(localStorage.getItem(COACHES_KEY) || '[]');
  if (!Array.isArray(actual) || actual.length === 0) {
    const semilla = [
      { dni: '201', nombre: 'Sofía', apellido: 'Martínez', especialidad: 'Fuerza', email: 'sofia@fit.com' },
      { dni: '202', nombre: 'Tomás', apellido: 'Gómez', especialidad: 'Hipertrofia', email: 'tomas@fit.com' },
      { dni: '203', nombre: 'Valentina', apellido: 'Rossi', especialidad: 'Running', email: 'valentina@run.com' },
      { dni: '204', nombre: 'Mateo', apellido: 'Fernández', especialidad: 'CrossFit', email: 'mateo@box.com' },
      { dni: '205', nombre: 'Lucía', apellido: 'Suárez', especialidad: 'Movilidad', email: 'lucia@mobility.com' },
    ];
    localStorage.setItem(COACHES_KEY, JSON.stringify(semilla));
    return semilla;
  }
  return actual;
}

function keyDeportistas(entrenadorDni) {
  return `coach:${entrenadorDni}:deportistas`;
}

export const FallbackCoach = {
  // ---- Lista de deportistas por entrenador
  getLista(entrenadorDni) {
    const key = keyDeportistas(entrenadorDni);
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  addPorUsername(entrenadorDni, username) {
    const key = keyDeportistas(entrenadorDni);
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const nuevo = { id: crypto.randomUUID(), dni: null, username, nombre: username, notas: [] };
    localStorage.setItem(key, JSON.stringify([nuevo, ...arr]));
    return nuevo;
  },

  quitar(entrenadorDni, id) {
    const key = keyDeportistas(entrenadorDni);
    const arr = JSON.parse(localStorage.getItem(key) || '[]').filter(d => String(d.id) !== String(id));
    localStorage.setItem(key, JSON.stringify(arr));
  },

  addDeportista(entrenadorDni, dep) {
    const key = keyDeportistas(entrenadorDni);
    const arr = JSON.parse(localStorage.getItem(key) || '[]');

    const nuevo = {
      id: String(dep?.dni ?? crypto.randomUUID()),
      dni: dep?.dni ?? null,
      username: dep?.username || dep?.usuario || null,
      nombre: dep?.nombre || dep?.username || dep?.usuario || '—',
      notas: [],
    };

    const yaExiste = arr.some(x =>
      (nuevo.dni && String(x.dni) === String(nuevo.dni)) ||
      (nuevo.username && x.username === nuevo.username)
    );
    if (!yaExiste) {
      localStorage.setItem(key, JSON.stringify([nuevo, ...arr]));
    }
    return nuevo;
  },

  quitarPorDni(entrenadorDni, deportistaDni) {
    const key = keyDeportistas(entrenadorDni);
    const arr = JSON.parse(localStorage.getItem(key) || '[]')
      .filter(d => String(d.dni) !== String(deportistaDni));
    localStorage.setItem(key, JSON.stringify(arr));
  },

  // ---- Entrenadores "semilla" para elegir desde el deportista
  getTodos() {
    return seedCoachesIfEmpty();
  },
  upsertTodos(nuevaLista) {
    if (!Array.isArray(nuevaLista)) return;
    localStorage.setItem(COACHES_KEY, JSON.stringify(nuevaLista));
  },

  // ---- NOTAS: deportista -> entrenador
  setNota(entrenadorDni, deportistaDni, texto) {
    const t = (texto || '').trim();
    if (!t) return null;

    const key = keyDeportistas(entrenadorDni);
    const arr = JSON.parse(localStorage.getItem(key) || '[]');

    let idx = arr.findIndex(d =>
      (deportistaDni && d.dni && String(d.dni) === String(deportistaDni)) ||
      String(d.id) === String(deportistaDni)
    );

    if (idx < 0) {
      // si por alguna razón no existe, lo creo mínimo
      arr.unshift({ id: String(deportistaDni || crypto.randomUUID()), dni: deportistaDni || null, nombre: '—', username: null, notas: [] });
      idx = 0;
    }

    arr[idx].notas = Array.isArray(arr[idx].notas) ? arr[idx].notas : [];
    arr[idx].notas.push({ id: crypto.randomUUID(), texto: t, fecha: nowISO() });

    localStorage.setItem(key, JSON.stringify(arr));
    return arr[idx];
  },

  getNotas(entrenadorDni, deportistaIdODni) {
    const key = keyDeportistas(entrenadorDni);
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const it = arr.find(d =>
      (deportistaIdODni && d.dni && String(d.dni) === String(deportistaIdODni)) ||
      String(d.id) === String(deportistaIdODni)
    );
    return Array.isArray(it?.notas) ? it.notas : [];
  },

  getUltimaNota(entrenadorDni, deportistaIdODni) {
    const notas = this.getNotas(entrenadorDni, deportistaIdODni);
    return notas.length ? notas[notas.length - 1] : null;
  },
};

export { API_URL };

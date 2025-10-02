const API_URL =
  (import.meta?.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
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
  listarTodos: () => api('/entrenamientos'), // por si lo usás en historial
};

// Fallback local para “mis deportistas” hasta que haya endpoints reales
export const FallbackCoach = {
  getLista(entrenadorDni) {
    const key = `coach:${entrenadorDni}:deportistas`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },
  addPorUsername(entrenadorDni, username) {
    const key = `coach:${entrenadorDni}:deportistas`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const nuevo = { id: crypto.randomUUID(), dni: null, username, nombre: username };
    localStorage.setItem(key, JSON.stringify([nuevo, ...arr]));
    return nuevo;
  },
  quitar(entrenadorDni, id) {
    const key = `coach:${entrenadorDni}:deportistas`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]').filter(d => String(d.id) !== String(id));
    localStorage.setItem(key, JSON.stringify(arr));
  },
};

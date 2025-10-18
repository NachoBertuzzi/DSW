// backend/controllers/asignacionEntrenamiento.controller.js
// Controlador CommonJS con RequestContext para MikroORM.

const { RequestContext } = require('@mikro-orm/core');

const ESTADOS_VALIDOS = ['pendiente', 'en_progreso', 'completado', 'cancelado'];

function em() {
  const mgr = RequestContext.getEntityManager();
  if (!mgr) {
    const err = new Error('No hay EntityManager en el contexto de la petición.');
    err.status = 500;
    throw err;
  }
  return mgr;
}

module.exports = {
  // POST /
  crearAsignacion: async (req, res) => {
    try {
      const { entrenadorDni, deportistaDni, entrenamientoId, fecha, notas } = req.body || {};

      if (!entrenadorDni || !deportistaDni || entrenamientoId === undefined) {
        return res.status(400).json({
          mensaje: 'Faltan campos obligatorios: entrenadorDni, deportistaDni, entrenamientoId.',
        });
      }
      if (Number.isNaN(Number(entrenamientoId))) {
        return res.status(400).json({ mensaje: 'entrenamientoId debe ser numérico.' });
      }

      const manager = em();
      const [entrenador, deportista, entrenamiento] = await Promise.all([
        manager.findOne('Entrenador', { dni: String(entrenadorDni) }),
        manager.findOne('Deportista', { dni: String(deportistaDni) }),
        manager.findOne('Entrenamiento', { id: Number(entrenamientoId) }), // AJUSTAR si el PK difiere
      ]);

      if (!entrenador) return res.status(404).json({ mensaje: `Entrenador con DNI ${entrenadorDni} no encontrado.` });
      if (!deportista) return res.status(404).json({ mensaje: `Deportista con DNI ${deportistaDni} no encontrado.` });
      if (!entrenamiento) return res.status(404).json({ mensaje: `Entrenamiento con id ${entrenamientoId} no encontrado.` });

      const payload = { entrenador, deportista, entrenamiento };
      if (fecha) {
        const f = new Date(fecha);
        if (Number.isNaN(f.getTime())) return res.status(400).json({ mensaje: 'fecha inválida (usar YYYY-MM-DD).' });
        payload.fecha = f;
      }
      if (notas) {
        if (typeof notas !== 'string' || notas.length > 1000) {
          return res.status(400).json({ mensaje: 'notas debe ser string de hasta 1000 caracteres.' });
        }
        payload.notas = notas;
      }

      const asig = manager.create('Asignacion', payload);
      await manager.persistAndFlush(asig);
      await manager.populate(asig, ['entrenador', 'deportista', 'entrenamiento']);

      return res.status(201).json({ data: asig });
    } catch (err) {
      return res.status(err.status || 500).json({ mensaje: 'Error al crear la asignación.', detalle: err.message });
    }
  },

  // GET /entrenadores/:dni
  listarPorEntrenador: async (req, res) => {
    try {
      const manager = em();
      const { dni } = req.params;
      const asigs = await manager.find(
        'Asignacion',
        { entrenador: String(dni) },
        { orderBy: { createdAt: 'DESC' }, populate: ['entrenador', 'deportista', 'entrenamiento'] }
      );
      return res.json({ data: asigs });
    } catch (err) {
      return res.status(500).json({ mensaje: 'Error al listar asignaciones por entrenador.', detalle: err.message });
    }
  },

  // GET /deportistas/:dni
  listarPorDeportista: async (req, res) => {
    try {
      const manager = em();
      const { dni } = req.params;
      const asigs = await manager.find(
        'Asignacion',
        { deportista: String(dni) },
        { orderBy: { createdAt: 'DESC' }, populate: ['entrenador', 'deportista', 'entrenamiento'] }
      );
      return res.json({ data: asigs });
    } catch (err) {
      return res.status(500).json({ mensaje: 'Error al listar asignaciones por deportista.', detalle: err.message });
    }
  },

  // GET /:id
  obtenerPorId: async (req, res) => {
    try {
      const manager = em();
      const { id } = req.params;
      const asig = await manager.findOne('Asignacion', { id }, { populate: ['entrenador', 'deportista', 'entrenamiento'] });
      if (!asig) return res.status(404).json({ mensaje: `Asignación con id ${id} no encontrada.` });
      return res.json({ data: asig });
    } catch (err) {
      return res.status(500).json({ mensaje: 'Error al obtener la asignación.', detalle: err.message });
    }
  },

  // PATCH /:id/estado
  actualizarEstado: async (req, res) => {
    try {
      const manager = em();
      const { id } = req.params;
      const { estado } = req.body || {};
      if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ mensaje: `Estado inválido. Valores: ${ESTADOS_VALIDOS.join(', ')}.` });
      }
      const asig = await manager.findOne('Asignacion', { id });
      if (!asig) return res.status(404).json({ mensaje: `Asignación con id ${id} no encontrada.` });

      asig.estado = estado;
      await manager.flush();
      await manager.populate(asig, ['entrenador', 'deportista', 'entrenamiento']);
      return res.json({ data: asig });
    } catch (err) {
      return res.status(500).json({ mensaje: 'Error al actualizar el estado.', detalle: err.message });
    }
  },

  // DELETE /:id
  eliminarAsignacion: async (req, res) => {
    try {
      const manager = em();
      const { id } = req.params;
      const asig = await manager.findOne('Asignacion', { id });
      if (!asig) return res.status(404).json({ mensaje: `Asignación con id ${id} no encontrada.` });
      await manager.removeAndFlush(asig);
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ mensaje: 'Error al eliminar la asignación.', detalle: err.message });
    }
  },
};

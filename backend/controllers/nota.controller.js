const { RequestContext } = require('@mikro-orm/core');

function em() {
  const manager = RequestContext.getEntityManager();
  if (!manager) throw new Error('No hay EntityManager en el contexto de la petición.');
  return manager;
}

async function crear(req, res) {
  try {
    const { entrenadorDni, deportistaDni, texto } = req.body || {};
    if (!entrenadorDni || !deportistaDni || !String(texto || '').trim()) {
      return res.status(400).json({ mensaje: 'Faltan datos de la nota' });
    }
    const manager = em();
    const [entrenador, deportista] = await Promise.all([
      manager.findOne('Entrenador', { dni: String(entrenadorDni) }),
      manager.findOne('Deportista', { dni: String(deportistaDni) }),
    ]);
    if (!entrenador || !deportista) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    const nota = manager.create('Nota', {
      texto: String(texto).trim(),
      entrenador,
      deportista,
    });
    await manager.persistAndFlush(nota);
    return res.status(201).json({ data: nota });
  } catch (error) {
    console.error('nota.crear:', error);
    return res.status(500).json({ mensaje: 'No se pudo guardar la nota' });
  }
}

async function listarPorDeportista(req, res) {
  try {
    const data = await em().find('Nota', { deportista: String(req.params.dni) }, {
      populate: ['entrenador'], orderBy: { fecha: 'DESC' },
    });
    return res.json({ data });
  } catch (error) {
    console.error('nota.listarPorDeportista:', error);
    return res.status(500).json({ mensaje: 'No se pudieron cargar las notas' });
  }
}

async function listarPorEntrenador(req, res) {
  try {
    const data = await em().find('Nota', { entrenador: String(req.params.dni) }, {
      populate: ['deportista'], orderBy: { fecha: 'DESC' },
    });
    return res.json({ data });
  } catch (error) {
    console.error('nota.listarPorEntrenador:', error);
    return res.status(500).json({ mensaje: 'No se pudieron cargar las notas' });
  }
}

module.exports = { crear, listarPorDeportista, listarPorEntrenador };

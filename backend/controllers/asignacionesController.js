const { RequestContext } = require('@mikro-orm/core');

function em() {
  const manager = RequestContext.getEntityManager();
  if (!manager) throw new Error('No hay EntityManager en el contexto de la petición.');
  return manager;
}

exports.putEntrenadorDeportista = async (req, res) => {
  try {
    const depDni = req.params.dni;
    const { entrenadorDni } = req.body || {};
    if (entrenadorDni !== null && entrenadorDni !== undefined && typeof entrenadorDni !== 'string') {
      return res.status(400).json({ mensaje: 'entrenadorDni debe ser string o null' });
    }
    const manager = em();
    const deportista = await manager.findOne('Deportista', { dni: String(depDni) });
    if (!deportista) return res.status(404).json({ mensaje: 'Deportista no encontrado' });
    deportista.entrenador = entrenadorDni
      ? await manager.findOne('Entrenador', { dni: String(entrenadorDni) })
      : null;
    if (entrenadorDni && !deportista.entrenador) {
      return res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    }
    await manager.flush();
    return res.json({ data: { deportistaDni: depDni, entrenadorDni: entrenadorDni ?? null } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error asignando entrenador' });
  }
};

exports.getEntrenadorDeportista = async (req, res) => {
  try {
    const deportista = await em().findOne('Deportista', { dni: String(req.params.dni) }, {
      populate: ['entrenador'],
    });
    if (!deportista) return res.status(404).json({ mensaje: 'Deportista no encontrado' });
    return res.json({ data: deportista.entrenador || null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error consultando entrenador' });
  }
};

exports.getDeportistasDeEntrenador = async (req, res) => {
  try {
    const coachDni = req.params.dni;
    const manager = em();
    const deportistas = await manager.find('Deportista', { entrenador: String(coachDni) });
    return res.json({ data: deportistas.map(({ dni, nombre, apellido, usuario }) => ({ dni, nombre, apellido, usuario })) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error listando deportistas del entrenador' });
  }
};

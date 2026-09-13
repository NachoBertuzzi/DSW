const { RequestContext } = require('@mikro-orm/core');
const { Entrenamiento } = require('../entities/entrenamiento.entity');
const { Deportista } = require('../entities/deportista.entity');
const { Entrenador } = require('../entities/entrenador.entity');
const { Asignacion } = require('../entities/asignacion.entity');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}


function toRef(_em, entity, value, keyForObject) {
  if (!value) return undefined;
  if (typeof value === 'string' || typeof value === 'number') return _em.getReference(entity, value);
  if (typeof value === 'object' && value[keyForObject]) return _em.getReference(entity, value[keyForObject]);
  return value; 
}

module.exports = {
  async getAll(user) {
    const _em = em();
    let where = {};

    if (user?.rol === 'deportista') {
      where = { deportista: String(user.dni) };
    } else if (user?.rol === 'entrenador') {
      const asignaciones = await _em.find(Asignacion, {
        entrenador: String(user.dni),
      }, { populate: ['entrenamiento'] });
      const idsAsignados = asignaciones
        .map((asignacion) => asignacion.entrenamiento?.id)
        .filter(Boolean);

      where = idsAsignados.length
        ? { $or: [{ entrenador: String(user.dni) }, { id: { $in: idsAsignados } }] }
        : { entrenador: String(user.dni) };
    }

    return _em.find(Entrenamiento, where, {
      populate: ['deportista', 'entrenador'],
      fields: [
        'id',
        'fechaEntrenamiento',
        'horaEntrenamiento',
        'ejercicios',
        'duracionSegundos',
        'estado',
        'deportista.dni',
        'deportista.nombre',
        'entrenador.dni',
        'entrenador.nombre',
      ],
      orderBy: { id: 'desc' },
    });
  },

  async getById({ id }) {
    const numId = Number.parseInt(id, 10);
    return em().findOne(Entrenamiento, { id: numId }, {
      populate: ['deportista', 'entrenador'],
    });
  },

  async canAccess(entrenamiento, user) {
    if (!entrenamiento || !user?.dni) return false;

    if (user.rol === 'deportista') {
      return String(entrenamiento.deportista?.dni) === String(user.dni);
    }

    if (user.rol !== 'entrenador') return false;

    if (String(entrenamiento.entrenador?.dni) === String(user.dni)) return true;

    return Boolean(await em().findOne(Asignacion, {
      entrenador: String(user.dni),
      entrenamiento: entrenamiento.id,
    }));
  },

  async prepareCreate(data, user) {
    const _em = em();
    const input = { ...data };

    if (user?.rol === 'deportista') {
      const deportista = await _em.findOne(Deportista, { dni: String(user.dni) }, {
        populate: ['entrenador'],
      });
      if (!deportista) return null;

      input.deportista = deportista.dni;
      input.entrenador = deportista.entrenador?.dni;
      return input;
    }

    if (user?.rol === 'entrenador') {
      const deportistaDni = input.deportista?.dni ?? input.deportista;
      if (!deportistaDni) return null;

      const deportista = await _em.findOne('Deportista', {
        dni: String(deportistaDni),
        entrenador: String(user.dni),
      });
      if (!deportista) return null;

      input.deportista = deportista.dni;
      input.entrenador = String(user.dni);
      return input;
    }

    return null;
  },

  async create(data) {
    const _em = em();

    if (data.deportista) data.deportista = toRef(_em, Deportista, data.deportista, 'dni');
    if (data.entrenador) data.entrenador = toRef(_em, Entrenador, data.entrenador, 'dni');

    const ent = _em.create(Entrenamiento, data);
    await _em.persistAndFlush(ent);

    return await _em.findOne(Entrenamiento, { id: ent.id }, { populate: ['deportista', 'entrenador'] });
  },

  async update(id, data) {
    const _em = em();
    const numId = Number.parseInt(id, 10);
    const ent = await _em.findOne(Entrenamiento, { id: numId });
    if (!ent) return undefined;

    if (data.deportista) data.deportista = toRef(_em, Deportista, data.deportista, 'dni');
    if (data.entrenador) data.entrenador = toRef(_em, Entrenador, data.entrenador, 'dni');

    _em.assign(ent, data);
    await _em.persistAndFlush(ent);

    return await _em.findOne(Entrenamiento, { id: ent.id }, { populate: ['deportista', 'entrenador'] });
  },

  async remove({ id }) {
    const _em = em();
    const numId = Number.parseInt(id, 10);
    const ent = await _em.findOne(Entrenamiento, { id: numId });
    if (!ent) return undefined;
    await _em.removeAndFlush(ent);
    return ent;
  },
};
const { RequestContext } = require('@mikro-orm/core');
const { Entrenamiento } = require('../entities/entrenamiento.entity');
const { Deportista } = require('../entities/deportista.entity');
const { Entrenador } = require('../entities/entrenador.entity');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}

// Helper: convierte string/objeto a referencia de entidad
function toRef(_em, entity, value, keyForObject) {
  if (!value) return undefined;
  if (typeof value === 'string' || typeof value === 'number') return _em.getReference(entity, value);
  if (typeof value === 'object' && value[keyForObject]) return _em.getReference(entity, value[keyForObject]);
  return value; // ya vino como entidad/ref
}

module.exports = {
  async getAll() {
    return em().find(Entrenamiento, {}, {
      populate: ['deportista', 'entrenador'],
      fields: [
        'id',
        'fechaEntrenamiento',
        'horaEntrenamiento',
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

  async create(data) {
    const _em = em();

    // convertir FKs si vienen como DNI string u objeto { dni: '...' }
    if (data.deportista) data.deportista = toRef(_em, Deportista, data.deportista, 'dni');
    if (data.entrenador) data.entrenador = toRef(_em, Entrenador, data.entrenador, 'dni');

    const ent = _em.create(Entrenamiento, data);
    await _em.persistAndFlush(ent);

    // devolvé con populate para el front
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

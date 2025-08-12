const { RequestContext } = require('@mikro-orm/core');
const { Entrenamiento } = require('../entities/entrenamiento.entity');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}

module.exports = {
  async getAll() {
    return em().find(Entrenamiento, {});
  },

  async getById({ id }) {
    const numId = Number.parseInt(id, 10);
    return em().findOne(Entrenamiento, { id: numId });
  },

  async create(data) {
    const _em = em();
    const ent = _em.create(Entrenamiento, data);
    await _em.persistAndFlush(ent);
    return ent;
  },

  async update(id, data) {
    const _em = em();
    const numId = Number.parseInt(id, 10);
    const ent = await _em.findOne(Entrenamiento, { id: numId });
    if (!ent) return undefined;
    _em.assign(ent, data);
    await _em.persistAndFlush(ent);
    return ent;
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

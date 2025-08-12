const { RequestContext } = require('@mikro-orm/core');
const { Entrenador } = require('../entities/entrenador.entity');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}

module.exports = {
  async getAll() {
    return em().find(Entrenador, {});
  },

  async getById({ dni }) {
    return em().findOne(Entrenador, { dni });
  },

  async create(data) {
    const _em = em();
    const exists = await _em.findOne(Entrenador, { dni: data.dni });
    if (exists) return exists;
    const ent = _em.create(Entrenador, data);
    await _em.persistAndFlush(ent);
    return ent;
  },

  async update(dni, data) {
    const _em = em();
    const ent = await _em.findOne(Entrenador, { dni });
    if (!ent) return undefined;
    _em.assign(ent, data);
    await _em.persistAndFlush(ent);
    return ent;
  },

  async remove({ dni }) {
    const _em = em();
    const ent = await _em.findOne(Entrenador, { dni });
    if (!ent) return undefined;
    await _em.removeAndFlush(ent);
    return ent;
  },
};

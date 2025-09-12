const { RequestContext } = require('@mikro-orm/core');
const { Localidad } = require('../entities/localidad.entity');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}

module.exports = {
  async getAll() {
    return em().find(Localidad, {}, {
      fields: ['codPostal', 'nombre', 'provincia'],
      orderBy: { codPostal: 'asc' },
    });
  },

  async getById({ codPostal }) {
    return em().findOne(Localidad, { codPostal });
  },

  async create(data) {
    const _em = em();
    const exists = await _em.findOne(Localidad, { codPostal: data.codPostal });
    if (exists) return exists;
    const loc = _em.create(Localidad, data);
    await _em.persistAndFlush(loc);
    return loc;
  },

  async update(codPostal, data) {
    const _em = em();
    const loc = await _em.findOne(Localidad, { codPostal });
    if (!loc) return undefined;
    _em.assign(loc, data);
    await _em.persistAndFlush(loc);
    return loc;
  },

  async remove({ codPostal }) {
    const _em = em();
    const loc = await _em.findOne(Localidad, { codPostal });
    if (!loc) return undefined;
    await _em.removeAndFlush(loc);
    return loc;
  },
};
